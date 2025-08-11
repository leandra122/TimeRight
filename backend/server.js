require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'timeright_secret';

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT,
    durationMin INTEGER DEFAULT 60
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    bio TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    serviceId INTEGER NOT NULL,
    professionalId INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed'
  )`);

  // Insert default data
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('123456', 10);
  
  db.run(`INSERT OR IGNORE INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)`, 
    ['Admin', 'admin@timeright.com', adminPassword, 'admin']);
  db.run(`INSERT OR IGNORE INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)`, 
    ['Maria Silva', 'maria@email.com', userPassword, 'user']);

  const services = [
    ['Manicure Simples', 'Manicure', '35,00', 'Cuidados completos para suas unhas', 60],
    ['Pedicure', 'Pedicure', '40,00', 'Relaxamento e beleza para seus pés', 90],
    ['Alongamento', 'Alongamento', '120,00', 'Unhas perfeitas e duradouras', 120]
  ];
  services.forEach(s => db.run(`INSERT OR IGNORE INTO services (title, category, price, description, durationMin) VALUES (?, ?, ?, ?, ?)`, s));

  const professionals = [
    ['Ana Costa', 'Manicure', 5, 'Especialista em manicure artística'],
    ['Carla Santos', 'Pedicure', 5, 'Expert em cuidados para os pés']
  ];
  professionals.forEach(p => db.run(`INSERT OR IGNORE INTO professionals (name, category, rating, bio) VALUES (?, ?, ?, ?)`, p));
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  const passwordHash = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)', [name, email, passwordHash], function(err) {
    if (err) return res.status(400).json({ message: 'Email já cadastrado' });
    
    const token = jwt.sign({ id: this.lastID, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: this.lastID, name, email, role: 'user' } });
  });
});

app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services', (err, services) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar serviços' });
    res.json({ data: services });
  });
});

app.get('/api/professionals', (req, res) => {
  db.all('SELECT * FROM professionals', (err, professionals) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar profissionais' });
    res.json({ data: professionals });
  });
});

app.get('/api/professionals/:id/availability', (req, res) => {
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  res.json({ data: availableTimes });
});

app.post('/api/bookings', authMiddleware, (req, res) => {
  const { serviceId, professionalId, date, time } = req.body;
  const userId = req.user.id;
  
  db.run('INSERT INTO bookings (userId, serviceId, professionalId, date, time) VALUES (?, ?, ?, ?, ?)',
    [userId, serviceId, professionalId, date, time], function(err) {
      if (err) return res.status(500).json({ message: 'Erro ao criar agendamento' });
      res.status(201).json({ message: 'Agendamento criado com sucesso' });
    });
});

app.get('/api/bookings', authMiddleware, (req, res) => {
  const userId = req.user.id;
  
  db.all(`SELECT b.*, s.title as serviceName, s.price, p.name as professionalName
          FROM bookings b
          JOIN services s ON b.serviceId = s.id
          JOIN professionals p ON b.professionalId = p.id
          WHERE b.userId = ?`, [userId], (err, bookings) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    res.json({ data: bookings });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeRight API rodando na porta ${PORT}`);
});