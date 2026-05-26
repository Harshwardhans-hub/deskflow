import React, { useState } from 'react';
import { createTicket } from '../api/tickets';

const EMPTY_FORM = { subject: '', description: '', customerEmail: '', priority: 'medium' };

function validateForm(data) {
  const errs = {};
  if (!data.subject.trim())       errs.subject       = 'Subject is required';
  if (!data.description.trim())   errs.description   = 'Description is required';
  if (!data.customerEmail.trim()) {
    errs.customerEmail = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(data.customerEmail)) {
    errs.customerEmail = 'Enter a valid email address';
  }
  if (!data.priority)             errs.priority      = 'Priority is required';
  return errs;
}

export default function CreateTicketForm({ onCreated, onClose }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]     = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const newTicket = await createTicket(form);
      onCreated(newTicket);
      onClose();
    } catch (err) {
      setSubmitError(err?.response?.data?.error || 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="btn-close" onClick={onClose}>×</button>
        <h2>Create New Ticket</h2>

        {submitError && <div className="form-submit-error">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" type="text"
              placeholder="Brief summary of the issue"
              value={form.subject} onChange={handleChange}
              className={errors.subject ? 'error' : ''} disabled={loading} />
            {errors.subject && <div className="field-error">{errors.subject}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description"
              placeholder="Describe the problem in detail"
              value={form.description} onChange={handleChange}
              className={errors.description ? 'error' : ''} disabled={loading} />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email</label>
            <input id="customerEmail" name="customerEmail" type="email"
              placeholder="customer@example.com"
              value={form.customerEmail} onChange={handleChange}
              className={errors.customerEmail ? 'error' : ''} disabled={loading} />
            {errors.customerEmail && <div className="field-error">{errors.customerEmail}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority"
              value={form.priority} onChange={handleChange}
              className={errors.priority ? 'error' : ''} disabled={loading}>
              <option value="low">Low — 72h SLA</option>
              <option value="medium">Medium — 24h SLA</option>
              <option value="high">High — 4h SLA</option>
              <option value="urgent">Urgent — 1h SLA</option>
            </select>
            {errors.priority && <div className="field-error">{errors.priority}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating…' : 'Create Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
