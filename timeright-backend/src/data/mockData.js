const bcrypt = require('bcryptjs');

// Dados mockados em memória
const data = {
  admins: [
    {
      id: 1,
      email: 'admin@timeright.com',
      password: bcrypt.hashSync('admin123', 10),
      name: 'Administrador TimeRight',
      active: true
    }
  ],
  categories: [
    { id: 1, name: 'Cabelo', description: 'Serviços de cabelo', active: true },
    { id: 2, name: 'Estética', description: 'Tratamentos estéticos', active: true },
    { id: 3, name: 'Unhas', description: 'Manicure e pedicure', active: true }
  ],
  professionals: [
    { id: 1, name: 'Maria Silva', specialty: 'Cabeleireira', categoryId: 1, active: true },
    { id: 2, name: 'Ana Costa', specialty: 'Esteticista', categoryId: 2, active: true }
  ],
  promotions: [
    {
      id: 1,
      title: 'Corte + Escova',
      description: 'Corte e escova por um preço especial',
      price: 80.00,
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      active: true
    }
  ],
  schedules: [
    {
      id: 1,
      professionalId: 1,
      date: '2024-12-02',
      startTime: '09:00',
      endTime: '10:00',
      available: true
    }
  ]
};

let nextId = {
  categories: 4,
  professionals: 3,
  promotions: 2,
  schedules: 2
};

module.exports = { data, nextId };