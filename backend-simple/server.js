const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get('/auth/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const validEmail = process.env.ADMIN_EMAIL || 'admin@timeright.com';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (email === validEmail && password === validPassword) {
    res.json({
      message: 'Login realizado com sucesso',
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB0aW1lcmlnaHQuY29tIn0.fake-token',
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});