import React from 'react';

export default function StatsStrip({ stats, loading }) {
  if (loading) {
    return (
      <div className="stats-strip">
        {['Open', 'In Progress', 'Resolved', 'Closed', 'SLA Breached'].map((label) => (
          <div key={label} className="stat-card" style={{ opacity: 0.4 }}>
            <div className="stat-value">—</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { key: 'open',        label: 'Open',        value: stats.statusCounts?.open ?? 0 },
    { key: 'in_progress', label: 'In Progress',  value: stats.statusCounts?.in_progress ?? 0 },
    { key: 'resolved',    label: 'Resolved',     value: stats.statusCounts?.resolved ?? 0 },
    { key: 'closed',      label: 'Closed',       value: stats.statusCounts?.closed ?? 0 },
    { key: 'breached',    label: 'SLA Breached', value: stats.breachedOpenCount ?? 0, isBreached: true },
  ];

  return (
    <div className="stats-strip">
      {items.map((item) => (
        <div key={item.key} className={`stat-card${item.isBreached ? ' breached' : ''}`}>
          <div className="stat-value">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
