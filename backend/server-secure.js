require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'timeright_super_secret_2024';

// Database
const db = new sqlite3.Database('./timeright_secure.db');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    active BOOLEAN DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialties TEXT,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 5.00,
    active BOOLEAN DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    professional_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert default data with env variables
  const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 12);
  const userPassword = bcrypt.hashSync(process.env.USER_PASSWORD || '123456', 12);
  
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Admin', 'admin@timeright.com', adminPassword, 'admin']);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Maria Silva', 'maria@email.com', userPassword, 'user']);

  const services = [
    ['Manicure Simples', 'Manicure', 35.00, 'Cuidados completos para suas unhas', 60],
    ['Pedicure', 'Pedicure', 45.00, 'Relaxamento e beleza para seus pés', 90],
    ['Alongamento', 'Alongamento', 120.00, 'Unhas perfeitas e duradouras', 120]
  ];
  services.forEach(s => db.run(`INSERT OR IGNORE INTO services (title, category, price, description, duration_minutes) VALUES (?, ?, ?, ?, ?)`, s));

  const professionals = [
    ['Ana Costa', 'Manicure,Alongamento', 'Especialista em nail art', 4.9],
    ['Carla Santos', 'Pedicure,Skincare', 'Expert em cuidados para pés', 4.8]
  ];
  professionals.forEach(p => db.run(`INSERT OR IGNORE INTO professionals (name, specialties, bio, rating) VALUES (?, ?, ?, ?)`, p));
});

// Secure middleware
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// CSRF protection
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' } });

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Token não fornecido' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso negado' });
  }
  next();
};

// Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Dados inválidos' });
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
    [name, email, hashedPassword], function(err) {
    if (err) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }
    
    const token = jwt.sign({ id: this.lastID, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: { id: this.lastID, name, email, role: 'user' }
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha obrigatórios' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    res.json({ success: true, user });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services WHERE active = 1', (err, services) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar serviços' });
    res.json({ success: true, data: services });
  });
});

app.post('/api/services', authMiddleware, adminMiddleware, csrfProtection, (req, res) => {
  const { title, category, price, description, duration_minutes } = req.body;
  
  db.run('INSERT INTO services (title, category, price, description, duration_minutes) VALUES (?, ?, ?, ?, ?)',
    [title, category, price, description || '', duration_minutes || 60], function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Erro ao criar serviço' });
      res.status(201).json({ success: true, message: 'Serviço criado com sucesso' });
    });
});

app.get('/api/professionals', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM professionals WHERE active = 1';
  let params = [];

  if (category) {
    query += ' AND specialties LIKE ?';
    params.push(`%${category}%`);
  }

  db.all(query, params, (err, professionals) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar profissionais' });
    res.json({ success: true, data: professionals });
  });
});

app.get('/api/professionals/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  db.all('SELECT booking_time FROM bookings WHERE professional_id = ? AND booking_date = ? AND status = "confirmed"',
    [id, date], (err, bookings) => {
      if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar disponibilidade' });

      const allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
      const bookedTimes = bookings.map(b => b.booking_time);
      const available = allTimes.filter(time => !bookedTimes.includes(time));

      res.json({ success: true, data: available });
    });
});

app.post('/api/bookings', authMiddleware, csrfProtection, (req, res) => {
  const { service_id, professional_id, booking_date, booking_time } = req.body;
  const user_id = req.user.id;

  db.get('SELECT id FROM bookings WHERE professional_id = ? AND booking_date = ? AND booking_time = ? AND status = "confirmed"',
    [professional_id, booking_date, booking_time], (err, existing) => {
      if (err) return res.status(500).json({ success: false, message: 'Erro ao verificar disponibilidade' });
      if (existing) return res.status(400).json({ success: false, message: 'Horário não disponível' });

      db.run('INSERT INTO bookings (user_id, service_id, professional_id, booking_date, booking_time) VALUES (?, ?, ?, ?, ?)',
        [user_id, service_id, professional_id, booking_date, booking_time], function(err) {
          if (err) return res.status(500).json({ success: false, message: 'Erro ao criar agendamento' });
          res.status(201).json({ success: true, message: 'Agendamento criado com sucesso' });
        });
    });
});

app.get('/api/bookings', authMiddleware, (req, res) => {
  const user_id = req.user.id;

  db.all(`SELECT b.*, s.title as service_name, s.price, p.name as professional_name
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN professionals p ON b.professional_id = p.id
          WHERE b.user_id = ?`, [user_id], (err, bookings) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    res.json({ success: true, data: bookings });
  });
});

app.get('/api/admin/bookings', authMiddleware, adminMiddleware, (req, res) => {
  db.all(`SELECT b.*, s.title as service_name, p.name as professional_name, u.name as user_name
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          JOIN professionals p ON b.professional_id = p.id
          JOIN users u ON b.user_id = u.id`, (err, bookings) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    res.json({ success: true, data: bookings });
  });
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TimeRight API segura funcionando!', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ success: false, message: 'Token CSRF inválido' });
  } else {
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🔒 TimeRight API Segura rodando na porta ${PORT}`);
  console.log(`✅ CSRF Protection: Habilitado`);
  console.log(`✅ HttpOnly Cookies: Habilitado`);
  console.log(`✅ CORS Restrito: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});