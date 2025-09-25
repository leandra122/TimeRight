const express = require('express');
const sql = require('mssql');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configuração do banco de dados
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Configuração do nodemailer
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Endpoint para recuperação de senha
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }

  try {
    // Conectar ao banco
    await sql.connect(dbConfig);

    // Verificar se o e-mail existe na tabela de admins
    const userResult = await sql.query`
      SELECT id FROM admins WHERE email = ${email}
    `;

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'E-mail não encontrado.' });
    }

    // Gerar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Data de expiração (10 minutos)
    const expiraEm = new Date(Date.now() + 10 * 60 * 1000);

    // Salvar código no banco
    await sql.query`
      INSERT INTO PasswordReset (email, codigo, expira_em)
      VALUES (${email}, ${codigo}, ${expiraEm})
    `;

    // Enviar e-mail
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Código de Recuperação de Senha',
      text: `Seu código de recuperação é: ${codigo}. Ele expira em 10 minutos.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Código de recuperação enviado para o e-mail informado.' });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    await sql.close();
  }
});

module.exports = router;