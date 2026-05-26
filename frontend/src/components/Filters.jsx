import React from 'react';

export default function Filters({ filters, onChange }) {
  return (
    <div className="filters">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label htmlFor="priority-filter">Priority</label>
        <select
          id="priority-filter"
          className="filter-select"
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <label className="filter-toggle">
        <input
          type="checkbox"
          checked={filters.breached}
          onChange={(e) => onChange({ ...filters, breached: e.target.checked })}
        />
        SLA Breached Only
      </label>

      <button
        className="btn-clear"
        onClick={() => onChange({ priority: '', breached: false })}
      >
        Clear Filters
      </button>
    </div>
  );
}
