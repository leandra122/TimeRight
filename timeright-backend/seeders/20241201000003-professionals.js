'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('professionals', [
      {
        name: 'Maria Silva',
        specialty: 'Cabeleireira e Colorista',
        photo: null,
        categoryId: 1, // Cabelo
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ana Costa',
        specialty: 'Esteticista Facial',
        photo: null,
        categoryId: 2, // Estética Facial
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Carla Santos',
        specialty: 'Manicure e Pedicure',
        photo: null,
        categoryId: 4, // Unhas
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Juliana Oliveira',
        specialty: 'Designer de Sobrancelhas',
        photo: null,
        categoryId: 5, // Sobrancelhas
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('professionals', null, {});
  }
};