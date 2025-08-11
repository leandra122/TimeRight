require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'timeright_secret_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database('./timeright.db');

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

  // Create admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Admin TimeRight', 'admin@timeright.com', adminPassword, 'admin']);

  // Create test user
  const userPassword = bcrypt.hashSync('123456', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Maria Silva', 'maria@email.com', userPassword, 'user']);
});

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
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
    [name, email, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    
    const token = jwt.sign({ id: this.lastID, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: this.lastID, name, email, role: 'user' }
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({ user });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'TimeRight API funcionando!', 
    timestamp: new Date().toISOString(),
    database: 'SQLite conectado'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeRight Backend rodando na porta ${PORT}`);
  console.log(`📊 Database: SQLite (timeright.db)`);
  console.log(`🔐 Credenciais de teste:`);
  console.log(`   Admin: admin@timeright.com / admin123`);
  console.log(`   User: maria@email.com / 123456`);
});