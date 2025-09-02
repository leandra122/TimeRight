const jwt = require('jsonwebtoken');
const { data } = require('../data/mockData');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = data.admins.find(a => a.id === decoded.id);

    if (!admin || !admin.active) {
      return res.status(401).json({ error: 'Token inválido ou usuário inativo' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;