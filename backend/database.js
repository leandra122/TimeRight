const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./timeright_complete.db');

// Initialize all tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sessions table for token persistence
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    device_info TEXT,
    ip_address TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Services table
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Professionals table
  db.run(`CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    specialties TEXT,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 5.00,
    photo_url TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    professional_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    total_price DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (service_id) REFERENCES services (id),
    FOREIGN KEY (professional_id) REFERENCES professionals (id)
  )`);

  // Insert default admin user
  const adminPassword = bcrypt.hashSync('admin123', 12);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)`, 
    ['Admin TimeRight', 'admin@timeright.com', adminPassword, 'admin', '(11) 99999-0000']);

  // Insert default test user
  const userPassword = bcrypt.hashSync('123456', 12);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)`, 
    ['Maria Silva', 'maria@email.com', userPassword, 'user', '(11) 98888-1111']);

  // Insert default services
  const services = [
    ['Manicure Simples', 'Manicure', 35.00, 'Cuidados completos para suas unhas das mãos', 60],
    ['Pedicure Completa', 'Pedicure', 45.00, 'Relaxamento e beleza para seus pés', 90],
    ['Alongamento de Unhas', 'Alongamento', 120.00, 'Unhas perfeitas e duradouras', 120],
    ['Skincare para Mãos', 'Skincare', 60.00, 'Tratamento hidratante para mãos', 45],
    ['Combo Mão + Pé', 'Promoções', 70.00, 'Manicure + Pedicure com desconto especial', 150]
  ];
  
  services.forEach(service => {
    db.run(`INSERT OR IGNORE INTO services (title, category, price, description, duration_minutes) VALUES (?, ?, ?, ?, ?)`, service);
  });

  // Insert default professionals
  const professionals = [
    ['Ana Costa', 'ana@timeright.com', '(11) 97777-2222', 'Manicure,Alongamento', 'Especialista em nail art e alongamento', 4.9],
    ['Carla Santos', 'carla@timeright.com', '(11) 96666-3333', 'Pedicure,Skincare', 'Expert em cuidados para pés e tratamentos', 4.8],
    ['Juliana Lima', 'juliana@timeright.com', '(11) 95555-4444', 'Manicure,Skincare', 'Profissional com 10 anos de experiência', 5.0]
  ];
  
  professionals.forEach(prof => {
    db.run(`INSERT OR IGNORE INTO professionals (name, email, phone, specialties, bio, rating) VALUES (?, ?, ?, ?, ?, ?)`, prof);
  });
});

module.exports = db;