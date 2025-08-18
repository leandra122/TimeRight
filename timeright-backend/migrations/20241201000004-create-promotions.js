'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      validTo: {
        type: Sequelize.DATE,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Criar índices para otimizar consultas
    await queryInterface.addIndex('promotions', ['title']);
    await queryInterface.addIndex('promotions', ['validFrom', 'validTo']);
    await queryInterface.addIndex('promotions', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promotions');
  }
};