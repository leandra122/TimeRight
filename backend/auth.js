const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'timeright_super_secret_2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '30d'; // 30 days

// Register new user
const register = (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nome, email e senha são obrigatórios' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Senha deve ter pelo menos 6 caracteres' 
    });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 12);

  // Insert user
  db.run(
    'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, phone || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ 
            success: false, 
            message: 'Este email já está cadastrado' 
          });
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Erro interno do servidor' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: this.lastID, email, role: 'user' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
      );

      // Save session
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const deviceInfo = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress;

      db.run(
        'INSERT INTO sessions (user_id, token, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
        [this.lastID, token, deviceInfo, ipAddress, expiresAt]
      );

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        token,
        user: {
          id: this.lastID,
          name,
          email,
          role: 'user',
          phone: phone || null
        }
      });
    }
  );
};

// Login user
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email e senha são obrigatórios' 
    });
  }

  // Find user
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Save session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    db.run(
      'INSERT INTO sessions (user_id, token, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.id, token, deviceInfo, ipAddress, expiresAt]
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  });
};

// Validate token and get user data
const validateToken = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido' 
    });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if session exists and is valid
    db.get(
      'SELECT s.*, u.name, u.email, u.role, u.phone FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")',
      [token],
      (err, session) => {
        if (err || !session) {
          return res.status(401).json({ 
            success: false, 
            message: 'Token inválido ou expirado' 
          });
        }

        res.json({
          success: true,
          user: {
            id: session.user_id,
            name: session.name,
            email: session.email,
            role: session.role,
            phone: session.phone
          }
        });
      }
    );
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Logout (invalidate session)
const logout = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    db.run('DELETE FROM sessions WHERE token = ?', [token]);
  }

  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acesso negado. Token não fornecido.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is valid
    db.get(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")',
      [token],
      (err, session) => {
        if (err || !session) {
          return res.status(401).json({ 
            success: false, 
            message: 'Token inválido ou expirado' 
          });
        }

        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

module.exports = {
  register,
  login,
  validateToken,
  logout,
  authMiddleware
};