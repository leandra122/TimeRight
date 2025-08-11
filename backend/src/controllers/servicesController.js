const db = require('../config/database');

const getServices = (req, res) => {
  db.all('SELECT * FROM services ORDER BY category, title', (err, services) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar serviços' });
    }
    res.json({ data: services });
  });
};

const createService = (req, res) => {
  const { title, category, price, description, durationMin } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({ message: 'Título, categoria e preço são obrigatórios' });
  }

  db.run(
    'INSERT INTO services (title, category, price, description, durationMin) VALUES (?, ?, ?, ?, ?)',
    [title, category, price, description || '', durationMin || 60],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao criar serviço' });
      }

      res.status(201).json({
        message: 'Serviço criado com sucesso',
        service: { id: this.lastID, title, category, price, description, durationMin }
      });
    }
  );
};

const updateService = (req, res) => {
  const { id } = req.params;
  const { title, category, price, description, durationMin } = req.body;

  db.run(
    'UPDATE services SET title = ?, category = ?, price = ?, description = ?, durationMin = ? WHERE id = ?',
    [title, category, price, description, durationMin, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar serviço' });
      }
      res.json({ message: 'Serviço atualizado com sucesso' });
    }
  );
};

const deleteService = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao deletar serviço' });
    }
    res.json({ message: 'Serviço deletado com sucesso' });
  });
};

module.exports = { getServices, createService, updateService, deleteService };