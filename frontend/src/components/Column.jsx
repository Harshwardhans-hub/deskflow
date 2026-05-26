import React from 'react';
import TicketCard from './TicketCard';

const CONFIG = {
  open:        { label: 'Open',        cls: 'col-open' },
  in_progress: { label: 'In Progress', cls: 'col-progress' },
  resolved:    { label: 'Resolved',    cls: 'col-resolved' },
  closed:      { label: 'Closed',      cls: 'col-closed' },
};

export default function Column({ status, tickets, onMove, onDelete }) {
  const { label, cls } = CONFIG[status];
  return (
    <div className={`column ${cls}`}>
      <div className="column-header">
        <div className="column-title">
          <span className="column-dot" />
          {label}
        </div>
        <span className="column-count">{tickets.length}</span>
      </div>
      <div className="column-body">
        {tickets.length === 0 ? (
          <div className="column-empty">No tickets here</div>
        ) : (
          tickets.map((t) => (
            <TicketCard key={t._id} ticket={t} onMove={onMove} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
