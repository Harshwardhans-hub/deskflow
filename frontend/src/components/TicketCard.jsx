import React from 'react';

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];
const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

// Converts raw minutes into a human-readable string like "3h 12m" or "2d 4h"
function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

export default function TicketCard({ ticket, onMove, onDelete }) {
  const currentIdx = STATUS_ORDER.indexOf(ticket.status);
  const canGoForward = currentIdx < STATUS_ORDER.length - 1;
  const canGoBack    = currentIdx > 0;
  const nextStatus   = canGoForward ? STATUS_ORDER[currentIdx + 1] : null;
  const prevStatus   = canGoBack    ? STATUS_ORDER[currentIdx - 1] : null;

  return (
    <div className={`ticket-card${ticket.slaBreached ? ' breached' : ''}`}>
      <div className="card-top">
        <div className="ticket-subject">{ticket.subject}</div>
        <span className={`priority-badge badge-${ticket.priority}`}>
          {ticket.priority}
        </span>
      </div>

      <div className="card-meta">
        <span className="ticket-age">⏱ {formatAge(ticket.ageMinutes)}</span>
        {ticket.slaBreached && <span className="sla-badge">⚠ SLA Breached</span>}
      </div>

      <div className="card-actions">
        {canGoBack && (
          <button
            className="btn-move"
            onClick={() => onMove(ticket._id, prevStatus)}
          >
            ← {STATUS_LABELS[prevStatus]}
          </button>
        )}
        {canGoForward && (
          <button
            className="btn-move"
            onClick={() => onMove(ticket._id, nextStatus)}
          >
            {STATUS_LABELS[nextStatus]} →
          </button>
        )}
        <button className="btn-delete" onClick={() => onDelete(ticket._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
