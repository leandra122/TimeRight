const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// CORS simples
app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
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
  console.log(`Servidor rodando na porta ${PORT}`);
});