'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Cabelo',
        description: 'Serviços relacionados ao cabelo: corte, coloração, tratamentos',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estética Facial',
        description: 'Tratamentos estéticos faciais: limpeza de pele, hidratação, peeling',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estética Corporal',
        description: 'Tratamentos estéticos corporais: massagens, drenagem, modelagem',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Unhas',
        description: 'Serviços de manicure e pedicure',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sobrancelhas',
        description: 'Design e tratamentos para sobrancelhas',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};