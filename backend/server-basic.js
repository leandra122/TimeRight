const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Database setup
const db = new sqlite3.Database('./timeright_basic.db');

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

  // Insert default admin
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Admin', 'admin@timeright.com', adminPassword, 'admin']);
});

// Middleware
app.use(cors());
app.use(express.json());

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

    res.json({ 
      success: true, 
      message: 'Cadastro realizado com sucesso',
      user: { id: this.lastID, name, email, role: 'user' }
    });
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

    res.json({ 
      success: true, 
      message: 'Login realizado com sucesso',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
    }
    res.json({ success: true, data: users });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeRight Basic API rodando na porta ${PORT}`);
  console.log(`📊 Banco SQLite inicializado`);
  console.log(`👤 Admin: admin@timeright.com / admin123`);
});