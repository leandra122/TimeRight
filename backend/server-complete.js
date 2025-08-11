require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const { register, login, validateToken, logout, authMiddleware } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://timeright.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Trust proxy for IP detection
app.set('trust proxy', true);

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', validateToken);
app.post('/api/auth/logout', logout);

// Services Routes
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services WHERE active = 1 ORDER BY category, title', (err, services) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar serviços' });
    }
    res.json({ success: true, data: services });
  });
});

app.post('/api/services', authMiddleware, (req, res) => {
  const { title, category, price, description, duration_minutes } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }

  db.run(
    'INSERT INTO services (title, category, price, description, duration_minutes) VALUES (?, ?, ?, ?, ?)',
    [title, category, price, description || '', duration_minutes || 60],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao criar serviço' });
      }
      res.status(201).json({ 
        success: true, 
        message: 'Serviço criado com sucesso',
        service: { id: this.lastID, title, category, price, description, duration_minutes }
      });
    }
  );
});

// Professionals Routes
app.get('/api/professionals', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM professionals WHERE active = 1';
  let params = [];

  if (category) {
    query += ' AND specialties LIKE ?';
    params.push(`%${category}%`);
  }

  query += ' ORDER BY name';

  db.all(query, params, (err, professionals) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar profissionais' });
    }
    res.json({ success: true, data: professionals });
  });
});

app.get('/api/professionals/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  // Get booked times for the professional on the specific date
  db.all(
    'SELECT booking_time FROM bookings WHERE professional_id = ? AND booking_date = ? AND status = "confirmed"',
    [id, date],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar disponibilidade' });
      }

      // Available time slots
      const allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
      const bookedTimes = bookings.map(b => b.booking_time);
      const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));

      res.json({ success: true, data: availableTimes });
    }
  );
});

// Bookings Routes
app.post('/api/bookings', authMiddleware, (req, res) => {
  const { service_id, professional_id, booking_date, booking_time, notes } = req.body;
  const user_id = req.user.id;

  // Check if time slot is available
  db.get(
    'SELECT id FROM bookings WHERE professional_id = ? AND booking_date = ? AND booking_time = ? AND status = "confirmed"',
    [professional_id, booking_date, booking_time],
    (err, existingBooking) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao verificar disponibilidade' });
      }

      if (existingBooking) {
        return res.status(400).json({ success: false, message: 'Horário não disponível' });
      }

      // Get service price
      db.get('SELECT price FROM services WHERE id = ?', [service_id], (err, service) => {
        if (err || !service) {
          return res.status(400).json({ success: false, message: 'Serviço não encontrado' });
        }

        // Create booking
        db.run(
          'INSERT INTO bookings (user_id, service_id, professional_id, booking_date, booking_time, notes, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [user_id, service_id, professional_id, booking_date, booking_time, notes || '', service.price],
          function(err) {
            if (err) {
              return res.status(500).json({ success: false, message: 'Erro ao criar agendamento' });
            }

            res.status(201).json({
              success: true,
              message: 'Agendamento criado com sucesso',
              booking: {
                id: this.lastID,
                service_id,
                professional_id,
                booking_date,
                booking_time,
                total_price: service.price
              }
            });
          }
        );
      });
    }
  );
});

app.get('/api/bookings', authMiddleware, (req, res) => {
  const user_id = req.user.id;

  db.all(`
    SELECT 
      b.*,
      s.title as service_name,
      s.price as service_price,
      p.name as professional_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN professionals p ON b.professional_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `, [user_id], (err, bookings) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
    res.json({ success: true, data: bookings });
  });
});

// Admin route to get all bookings
app.get('/api/admin/bookings', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }

  db.all(`
    SELECT 
      b.*,
      s.title as service_name,
      s.price as service_price,
      p.name as professional_name,
      u.name as user_name,
      u.email as user_email
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN professionals p ON b.professional_id = p.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `, (err, bookings) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
    res.json({ success: true, data: bookings });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TimeRight API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    database: 'SQLite conectado e funcionando',
    features: [
      'Cadastro e login persistente',
      'Sessões com 30 dias de validade',
      'Senhas criptografadas',
      'Sistema completo de agendamentos'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeRight API rodando na porta ${PORT}`);
  console.log(`📊 Banco de dados: SQLite (timeright_complete.db)`);
  console.log(`🔐 Sessões persistentes: 30 dias`);
  console.log(`🌐 CORS habilitado para múltiplos domínios`);
  console.log(`\n📝 Credenciais de teste:`);
  console.log(`   👤 Admin: admin@timeright.com / admin123`);
  console.log(`   👤 User: maria@email.com / 123456`);
  console.log(`\n📡 Endpoints disponíveis:`);
  console.log(`   POST /api/auth/register - Cadastro`);
  console.log(`   POST /api/auth/login - Login`);
  console.log(`   GET  /api/auth/me - Validar token`);
  console.log(`   POST /api/auth/logout - Logout`);
  console.log(`   GET  /api/services - Listar serviços`);
  console.log(`   GET  /api/professionals - Listar profissionais`);
  console.log(`   POST /api/bookings - Criar agendamento`);
  console.log(`   GET  /api/bookings - Meus agendamentos`);
});