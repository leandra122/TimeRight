'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await queryInterface.bulkInsert('admins', [{
      email: 'admin@timeright.com',
      password: hashedPassword,
      name: 'Administrador TimeRight',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {
      email: 'admin@timeright.com'
    }, {});
  }
};