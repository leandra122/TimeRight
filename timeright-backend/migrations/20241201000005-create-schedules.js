'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      professionalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'professionals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      available: {
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
    await queryInterface.addIndex('schedules', ['professionalId']);
    await queryInterface.addIndex('schedules', ['date']);
    await queryInterface.addIndex('schedules', ['available']);
    await queryInterface.addIndex('schedules', ['professionalId', 'date']);
    
    // Constraint única para evitar conflitos de horário
    await queryInterface.addConstraint('schedules', {
      fields: ['professionalId', 'date', 'startTime'],
      type: 'unique',
      name: 'unique_professional_date_time'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('schedules');
  }
};