const express = require('express');
const { getProfessionals, getAvailability, createProfessional } = require('../controllers/professionalsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProfessionals);
router.get('/:id/availability', getAvailability);
router.post('/', authMiddleware, adminMiddleware, createProfessional);

module.exports = router;