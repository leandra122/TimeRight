const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { data } = require('../data/mockData');

class AuthController {
  // Login do administrador
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Buscar admin por email
      const admin = data.admins.find(a => a.email === email && a.active);
      if (!admin) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Dados do admin logado
  async me(req, res, next) {
    try {
      res.json({
        admin: {
          id: req.admin.id,
          name: req.admin.name,
          email: req.admin.email
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();