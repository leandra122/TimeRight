const db = require('../config/database');

const createBooking = (req, res) => {
  const { serviceId, professionalId, date, time } = req.body;
  const userId = req.user.id;

  if (!serviceId || !professionalId || !date || !time) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  // Check if time slot is available
  db.get(
    'SELECT id FROM bookings WHERE professionalId = ? AND date = ? AND time = ?',
    [professionalId, date, time],
    (err, existingBooking) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao verificar disponibilidade' });
      }

      if (existingBooking) {
        return res.status(400).json({ message: 'Horário não disponível' });
      }

      db.run(
        'INSERT INTO bookings (userId, serviceId, professionalId, date, time) VALUES (?, ?, ?, ?, ?)',
        [userId, serviceId, professionalId, date, time],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erro ao criar agendamento' });
          }

          res.status(201).json({
            message: 'Agendamento criado com sucesso',
            booking: { id: this.lastID, userId, serviceId, professionalId, date, time }
          });
        }
      );
    }
  );
};

const getUserBookings = (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT b.*, s.title as serviceName, s.price, p.name as professionalName
    FROM bookings b
    JOIN services s ON b.serviceId = s.id
    JOIN professionals p ON b.professionalId = p.id
    WHERE b.userId = ?
    ORDER BY b.date DESC, b.time DESC
  `, [userId], (err, bookings) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
    res.json({ data: bookings });
  });
};

const getAllBookings = (req, res) => {
  db.all(`
    SELECT b.*, s.title as serviceName, s.price, p.name as professionalName, u.name as userName
    FROM bookings b
    JOIN services s ON b.serviceId = s.id
    JOIN professionals p ON b.professionalId = p.id
    JOIN users u ON b.userId = u.id
    ORDER BY b.date DESC, b.time DESC
  `, (err, bookings) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
    res.json({ data: bookings });
  });
};

const cancelBooking = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  let query = 'UPDATE bookings SET status = ? WHERE id = ?';
  let params = ['cancelled', id];

  if (!isAdmin) {
    query += ' AND userId = ?';
    params.push(userId);
  }

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao cancelar agendamento' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Agendamento cancelado com sucesso' });
  });
};

module.exports = { createBooking, getUserBookings, getAllBookings, cancelBooking };