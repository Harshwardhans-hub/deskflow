const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { SLA_TARGETS } = require('../models/Ticket');

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

function isValidTransition(from, to) {
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  const diff = toIdx - fromIdx;
  return diff === 1 || diff === -1;
}

function computeDerived(ticket) {
  const obj = ticket.toObject ? ticket.toObject() : { ...ticket };
  const now = new Date();
  const end =
    (obj.status === 'resolved' || obj.status === 'closed') && obj.resolvedAt
      ? new Date(obj.resolvedAt)
      : now;
  const ageMinutes = Math.floor((end - new Date(obj.createdAt)) / 60000);
  const slaBreached = ageMinutes > SLA_TARGETS[obj.priority];
  return { ...obj, ageMinutes, slaBreached };
}

router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    const errors = [];

    if (!subject || !subject.trim()) errors.push('subject is required');
    if (!description || !description.trim()) errors.push('description is required');
    if (!customerEmail || !customerEmail.trim()) {
      errors.push('customerEmail is required');
    } else if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
      errors.push('customerEmail must be a valid email');
    }
    if (!priority) {
      errors.push('priority is required');
    } else if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      errors.push('priority must be one of: low, medium, high, urgent');
    }

    if (errors.length > 0) return res.status(400).json({ error: errors.join('; ') });

    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();
    return res.status(201).json(computeDerived(ticket));
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join('; ') });
    }
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    let breachedOpenCount = 0;

    tickets.forEach((t) => {
      const derived = computeDerived(t);
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
      if (derived.slaBreached && (t.status === 'open' || t.status === 'in_progress')) {
        breachedOpenCount++;
      }
    });

    return res.json({ statusCounts, priorityCounts, breachedOpenCount });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const query = {};

    if (status) {
      if (!STATUS_ORDER.includes(status)) return res.status(400).json({ error: 'Invalid status filter value' });
      query.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) return res.status(400).json({ error: 'Invalid priority filter value' });
      query.priority = priority;
    }

    let results = (await Ticket.find(query).sort({ createdAt: -1 })).map(computeDerived);

    if (breached === 'true') results = results.filter(t => t.slaBreached);

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const { status, ...otherUpdates } = req.body;

    if (status && status !== ticket.status) {
      if (!STATUS_ORDER.includes(status)) {
        return res.status(400).json({ error: `Invalid status "${status}". Must be one of: ${STATUS_ORDER.join(', ')}` });
      }
      if (!isValidTransition(ticket.status, status)) {
        return res.status(400).json({
          error: `Transition from "${ticket.status}" to "${status}" is not allowed. Only one step forward or one step back is permitted.`,
        });
      }
      if (status === 'resolved') ticket.resolvedAt = new Date();
      else if (ticket.status === 'resolved') ticket.resolvedAt = null;
      ticket.status = status;
    }

    ['subject', 'description', 'customerEmail', 'priority'].forEach(field => {
      if (otherUpdates[field] !== undefined) ticket[field] = otherUpdates[field];
    });

    await ticket.save();
    return res.json(computeDerived(ticket));
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join('; ') });
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ticket ID' });
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.json({ message: 'Ticket deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ticket ID' });
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
