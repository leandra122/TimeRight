const express = require('express');

const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const professionalRoutes = require('./professionals');
const promotionRoutes = require('./promotions');
const scheduleRoutes = require('./schedules');

const router = express.Router();

// Rotas da API
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/promotions', promotionRoutes);
router.use('/schedules', scheduleRoutes);

module.exports = router;