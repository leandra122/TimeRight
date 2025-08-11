const db = require('../config/database');

const getProfessionals = (req, res) => {
  const { category } = req.query;
  
  let query = 'SELECT * FROM professionals ORDER BY name';
  let params = [];

  if (category) {
    query = 'SELECT * FROM professionals WHERE category = ? ORDER BY name';
    params = [category];
  }

  db.all(query, params, (err, professionals) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar profissionais' });
    }
    res.json({ data: professionals });
  });
};

const getAvailability = (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  // Mock availability - in real app, check bookings table
  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  db.all(
    'SELECT time FROM bookings WHERE professionalId = ? AND date = ?',
    [id, date],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao buscar disponibilidade' });
      }

      const bookedTimes = bookings.map(booking => booking.time);
      const available = availableTimes.filter(time => !bookedTimes.includes(time));

      res.json({ data: available });
    }
  );
};

const createProfessional = (req, res) => {
  const { name, category, rating, bio, photoUrl } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'Nome e categoria são obrigatórios' });
  }

  db.run(
    'INSERT INTO professionals (name, category, rating, bio, photoUrl) VALUES (?, ?, ?, ?, ?)',
    [name, category, rating || 5, bio || '', photoUrl || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criar profissional' });
      }

      res.status(201).json({
        message: 'Profissional criado com sucesso',
        professional: { id: this.lastID, name, category, rating, bio, photoUrl }
      });
    }
  );
};

module.exports = { getProfessionals, getAvailability, createProfessional };