const express = require('express');
const app = express();
const PORT = 8080;

// CORS totalmente liberado
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  
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
  console.log(`Servidor sem CORS rodando na porta ${PORT}`);
});