import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Board from './components/Board';
import StatsStrip from './components/StatsStrip';
import Filters from './components/Filters';
import CreateTicketForm from './components/CreateTicketForm';
import { fetchTickets, fetchStats, updateTicket, deleteTicket } from './api/tickets';

export default function App() {
  const [tickets, setTickets]         = useState([]);
  const [stats, setStats]             = useState(null);
  const [filters, setFilters]         = useState({ priority: '', breached: false });
  const [loading, setLoading]         = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]             = useState('');
  const [moveError, setMoveError]     = useState('');
  const [showForm, setShowForm]       = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTickets(filters);
      setTickets(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // stats failing is non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { loadStats(); },  [loadStats]);

  async function handleMove(id, newStatus) {
    setMoveError('');
    // Optimistically update the UI first, then confirm with the server
    const snapshot = [...tickets];
    setTickets((prev) => prev.map((t) => t._id === id ? { ...t, status: newStatus } : t));
    try {
      const updated = await updateTicket(id, { status: newStatus });
      setTickets((prev) => prev.map((t) => t._id === id ? updated : t));
      loadStats();
    } catch (err) {
      setTickets(snapshot); // revert on failure
      const msg = err?.response?.data?.error || 'Could not move ticket.';
      setMoveError(msg);
      setTimeout(() => setMoveError(''), 4000);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    setTickets((prev) => prev.filter((t) => t._id !== id));
    try {
      await deleteTicket(id);
      loadStats();
    } catch {
      loadTickets(); // reload if delete fails
    }
  }

  function handleCreated(newTicket) {
    setTickets((prev) => [newTicket, ...prev]);
    loadStats();
  }

  return (
    <div className="app">
      <div className="app-header">
        <div>
          <h1>DeskFlow</h1>
          <p>Support Ticket Triage Board</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Ticket
        </button>
      </div>

      <StatsStrip stats={stats} loading={statsLoading} />
      <Filters filters={filters} onChange={setFilters} />

      {moveError && <div className="toast-error">{moveError}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading tickets…
        </div>
      ) : error ? (
        <div className="error-state">
          <div>{error}</div>
          <button className="btn-retry" onClick={loadTickets}>Retry</button>
        </div>
      ) : (
        <Board tickets={tickets} onMove={handleMove} onDelete={handleDelete} />
      )}

      {showForm && (
        <CreateTicketForm onCreated={handleCreated} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
