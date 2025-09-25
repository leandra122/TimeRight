# Backend Node.js - TimeRight

## 🚀 Instalação

```bash
cd backend-node
npm install
```

## ⚙️ Configuração

1. Configure o arquivo `.env` com suas credenciais:
   - Banco SQL Server
   - SMTP para envio de emails

2. Execute o script SQL para criar as tabelas:
   ```sql
   -- Execute o arquivo sql/create-tables.sql no seu SQL Server
   ```

## 🏃‍♂️ Executar

```bash
npm run dev  # Desenvolvimento com nodemon
npm start    # Produção
```

## 📡 Endpoints

### POST /auth/forgot-password
Envia código de recuperação de senha por email.

**Body:**
```json
{
  "email": "admin@timeright.com"
}
```

**Resposta de Sucesso:**
```json
{
  "message": "Código de recuperação enviado para o e-mail informado."
}
```

**Resposta de Erro:**
```json
{
  "error": "E-mail não encontrado."
}
```

## 🔧 Funcionalidades

- ✅ Geração de código de 6 dígitos
- ✅ Validação de email no banco
- ✅ Expiração em 10 minutos
- ✅ Envio por nodemailer
- ✅ Integração com SQL Server