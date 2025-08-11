const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)',
    [name, email, passwordHash],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const token = jwt.sign(
        { id: this.lastID, email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: { id: this.lastID, name, email, role: 'user' }
      });
    }
  );
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }
  );
};

module.exports = { register, login };