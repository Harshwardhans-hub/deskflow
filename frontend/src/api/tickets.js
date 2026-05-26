import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const fetchTickets = async (filters = {}) => {
  const params = {};
  if (filters.priority) params.priority = filters.priority;
  if (filters.breached) params.breached = 'true';
  const res = await api.get('/tickets', { params });
  return res.data;
};

export const createTicket = async (data) => {
  const res = await api.post('/tickets', data);
  return res.data;
};

export const updateTicket = async (id, data) => {
  const res = await api.patch(`/tickets/${id}`, data);
  return res.data;
};

export const deleteTicket = async (id) => {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
};

export const fetchStats = async () => {
  const res = await api.get('/tickets/stats');
  return res.data;
};
