import React from 'react';
import Column from './Column';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default function Board({ tickets, onMove, onDelete }) {
  // Group tickets by their status
  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = tickets.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="board">
      {STATUSES.map((status) => (
        <Column
          key={status}
          status={status}
          tickets={grouped[status]}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
