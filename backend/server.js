const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const ticketRoutes = require('./routes/tickets');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://frontend-cyan-five-63.vercel.app',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());

app.use('/tickets', ticketRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
