const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom routes for authentication
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email }).value();
  
  if (user && user.passwordHash === password) {
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({
      token: 'mock-jwt-token',
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

server.post('/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  const db = router.db;
  
  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    phone,
    role: 'user',
    passwordHash: password,
    createdAt: new Date().toISOString()
  };
  
  db.get('users').push(newUser).write();
  
  const { passwordHash, ...userWithoutPassword } = newUser;
  res.json({
    token: 'mock-jwt-token',
    user: userWithoutPassword
  });
});

// Custom route for professional availability
server.get('/professionals/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  
  // Mock availability slots
  const slots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  res.json(slots);
});

// Custom route for admin bookings
server.get('/admin/bookings', (req, res) => {
  const db = router.db;
  const bookings = db.get('bookings')
    .map(booking => ({
      ...booking,
      user: db.get('users').find({ id: booking.userId }).value(),
      service: db.get('services').find({ id: booking.serviceId }).value(),
      professional: db.get('professionals').find({ id: booking.professionalId }).value()
    }))
    .value();
  
  res.json(bookings);
});

server.use(router);
server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});