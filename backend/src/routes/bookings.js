const express = require('express');
const { createBooking, getUserBookings, getAllBookings, cancelBooking } = require('../controllers/bookingsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getUserBookings);
router.get('/admin', authMiddleware, adminMiddleware, getAllBookings);
router.put('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;