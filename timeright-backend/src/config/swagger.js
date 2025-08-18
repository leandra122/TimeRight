const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TimeRight API',
      version: '1.0.0',
      description: 'API administrativa para gerenciamento do sistema TimeRight',
      contact: {
        name: 'TimeRight Support',
        email: 'support@timeright.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api`,
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint /auth/login'
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Autenticação de administradores'
      },
      {
        name: 'Categories',
        description: 'Gerenciamento de categorias de serviços'
      },
      {
        name: 'Professionals',
        description: 'Gerenciamento de profissionais'
      },
      {
        name: 'Promotions',
        description: 'Gerenciamento de promoções'
      },
      {
        name: 'Schedules',
        description: 'Gerenciamento de agendas'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;