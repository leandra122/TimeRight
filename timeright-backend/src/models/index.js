const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {
  sequelize,
  Sequelize,
  Admin: require('./Admin')(sequelize, Sequelize.DataTypes),
  Category: require('./Category')(sequelize, Sequelize.DataTypes),
  Professional: require('./Professional')(sequelize, Sequelize.DataTypes),
  Promotion: require('./Promotion')(sequelize, Sequelize.DataTypes),
  Schedule: require('./Schedule')(sequelize, Sequelize.DataTypes)
};

// Associações
db.Professional.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });
db.Category.hasMany(db.Professional, { foreignKey: 'categoryId', as: 'professionals' });

db.Schedule.belongsTo(db.Professional, { foreignKey: 'professionalId', as: 'professional' });
db.Professional.hasMany(db.Schedule, { foreignKey: 'professionalId', as: 'schedules' });

module.exports = db;