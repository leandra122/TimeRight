require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const servicesRoutes = require('./src/routes/services');
const professionalsRoutes = require('./src/routes/professionals');
const bookingsRoutes = require('./src/routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/bookings', bookingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'TimeRight API is running!', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeRight API rodando na porta ${PORT}`);
  console.log(`📊 Banco de dados SQLite inicializado`);
});