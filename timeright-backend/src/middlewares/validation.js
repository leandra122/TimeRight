const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  category: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Nome é obrigatório'
    }),
    description: Joi.string().allow(''),
    active: Joi.boolean()
  }),

  professional: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Nome é obrigatório'
    }),
    specialty: Joi.string().required().messages({
      'any.required': 'Especialidade é obrigatória'
    }),
    categoryId: Joi.number().integer().required().messages({
      'any.required': 'Categoria é obrigatória'
    }),
    active: Joi.boolean()
  }),

  promotion: Joi.object({
    title: Joi.string().required().messages({
      'any.required': 'Título é obrigatório'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Descrição é obrigatória'
    }),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Preço deve ser positivo',
      'any.required': 'Preço é obrigatório'
    }),
    validFrom: Joi.date().required().messages({
      'any.required': 'Data inicial é obrigatória'
    }),
    validTo: Joi.date().greater(Joi.ref('validFrom')).required().messages({
      'date.greater': 'Data final deve ser posterior à data inicial',
      'any.required': 'Data final é obrigatória'
    }),
    active: Joi.boolean()
  }),

  schedule: Joi.object({
    professionalId: Joi.number().integer().required().messages({
      'any.required': 'Profissional é obrigatório'
    }),
    date: Joi.date().required().messages({
      'any.required': 'Data é obrigatória'
    }),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Horário inicial deve ter formato HH:MM',
      'any.required': 'Horário inicial é obrigatório'
    }),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Horário final deve ter formato HH:MM',
      'any.required': 'Horário final é obrigatório'
    }),
    available: Joi.boolean()
  })
};

module.exports = { validate, schemas };