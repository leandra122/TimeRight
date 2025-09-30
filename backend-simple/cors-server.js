const express = require('express');
const app = express();
const PORT = 8080;

// Middleware para CORS manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@timeright.com' && password === 'admin123') {
    res.json({
      message: 'Login realizado com sucesso',
      token: 'fake-token-123',
      admin: {
        id: 1,
        name: 'Administrador Time Right',
        email: 'admin@timeright.com'
      }
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor CORS rodando na porta ${PORT}`);
});