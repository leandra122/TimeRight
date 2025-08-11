const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Services table
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT,
    durationMin INTEGER DEFAULT 60,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Professionals table
  db.run(`CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    bio TEXT,
    photoUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    serviceId INTEGER NOT NULL,
    professionalId INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (serviceId) REFERENCES services (id),
    FOREIGN KEY (professionalId) REFERENCES professionals (id)
  )`);

  // Insert default admin user
  db.run(`INSERT OR IGNORE INTO users (name, email, passwordHash, role) 
          VALUES ('Admin', 'admin@timeright.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')`);
  
  // Insert default services
  const services = [
    ['Manicure Simples', 'Manicure', '35,00', 'Cuidados completos para suas unhas das mãos', 60],
    ['Pedicure', 'Pedicure', '40,00', 'Relaxamento e beleza para seus pés', 90],
    ['Alongamento de Unha', 'Alongamento', '120,00', 'Unhas perfeitas e duradouras', 120],
    ['Skincare para Pés', 'Skincare', '60,00', 'Tratamento para pele dos pés', 45],
    ['Skincare para Mãos', 'Skincare', '60,00', 'Tratamento para pele das mãos', 45],
    ['Combo Mão + Pé', 'Promoções', '65,00', 'Manicure + Pedicure com desconto', 150]
  ];

  services.forEach(service => {
    db.run(`INSERT OR IGNORE INTO services (title, category, price, description, durationMin) 
            VALUES (?, ?, ?, ?, ?)`, service);
  });

  // Insert default professionals
  const professionals = [
    ['Ana Costa', 'Manicure', 5, 'Especialista em manicure artística'],
    ['Carla Santos', 'Pedicure', 5, 'Expert em cuidados para os pés'],
    ['Juliana Lima', 'Alongamento', 5, 'Mestre em alongamento de unhas']
  ];

  professionals.forEach(prof => {
    db.run(`INSERT OR IGNORE INTO professionals (name, category, rating, bio) 
            VALUES (?, ?, ?, ?)`, prof);
  });
});

module.exports = db;