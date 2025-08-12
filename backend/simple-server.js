const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 5000;

// Database setup
const db = new sqlite3.Database('./timeright.db');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    professional_name TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed'
  )`);

  // Insert default admin
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Admin', 'admin@timeright.com', adminPassword, 'admin']);

  // Insert default services
  const services = [
    ['Manicure Simples', 'Manicure', '35,00', 'Cuidados completos para suas unhas'],
    ['Pedicure', 'Pedicure', '45,00', 'Relaxamento e beleza para seus pés'],
    ['Alongamento', 'Alongamento', '120,00', 'Unhas perfeitas e duradouras']
  ];
  services.forEach(s => db.run(`INSERT OR IGNORE INTO services (title, category, price, description) VALUES (?, ?, ?, ?)`, s));
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'timeright-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Login necessário' });
  }
  next();
};

// Routes
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Senha deve ter pelo menos 6 caracteres' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
    [name, email, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, message: 'Email já cadastrado' });
      }
      return res.status(500).json({ success: false, message: 'Erro interno' });
    }

    req.session.user = { id: this.lastID, name, email, role: 'user' };
    res.json({ success: true, message: 'Cadastro realizado com sucesso', user: req.session.user });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ success: true, message: 'Login realizado com sucesso', user: req.session.user });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services', (err, services) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar serviços' });
    res.json({ success: true, data: services });
  });
});

app.post('/api/bookings', requireAuth, (req, res) => {
  const { service_id, professional_name, booking_date, booking_time } = req.body;
  const user_id = req.session.user.id;

  if (!service_id || !professional_name || !booking_date || !booking_time) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
  }

  db.run('INSERT INTO bookings (user_id, service_id, professional_name, booking_date, booking_time) VALUES (?, ?, ?, ?, ?)',
    [user_id, service_id, professional_name, booking_date, booking_time], function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Erro ao criar agendamento' });
      res.json({ success: true, message: 'Agendamento criado com sucesso' });
    });
});

app.get('/api/bookings', requireAuth, (req, res) => {
  const user_id = req.session.user.id;

  db.all(`SELECT b.*, s.title as service_name, s.price 
          FROM bookings b 
          JOIN services s ON b.service_id = s.id 
          WHERE b.user_id = ?`, [user_id], (err, bookings) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    res.json({ success: true, data: bookings });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeRight Server rodando na porta ${PORT}`);
  console.log(`📊 Banco SQLite inicializado`);
  console.log(`🔐 Sessões ativas por 24h`);
  console.log(`👤 Admin: admin@timeright.com / admin123`);
});