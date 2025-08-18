const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação do Joi
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details?.map(detail => detail.message) || err.message
    });
  }

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.errors.map(error => error.message)
    });
  }

  // Erro de constraint única do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Recurso já existe',
      details: err.errors.map(error => error.message)
    });
  }

  // Erro de chave estrangeira do Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Referência inválida',
      details: 'O recurso referenciado não existe'
    });
  }

  // Erro de conexão com banco
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: 'Erro de conexão com banco de dados'
    });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
};

module.exports = errorHandler;