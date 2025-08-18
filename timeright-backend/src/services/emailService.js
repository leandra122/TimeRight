const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendNotification(type, data) {
    try {
      const templates = {
        professional_created: {
          subject: 'Novo Profissional Cadastrado',
          html: `
            <h2>Novo Profissional Cadastrado</h2>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Especialidade:</strong> ${data.specialty}</p>
            <p><strong>Categoria:</strong> ${data.category?.name || 'N/A'}</p>
          `
        },
        professional_updated: {
          subject: 'Profissional Atualizado',
          html: `
            <h2>Profissional Atualizado</h2>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Especialidade:</strong> ${data.specialty}</p>
            <p><strong>Categoria:</strong> ${data.category?.name || 'N/A'}</p>
          `
        },
        promotion_created: {
          subject: 'Nova Promoção Criada',
          html: `
            <h2>Nova Promoção Criada</h2>
            <p><strong>Título:</strong> ${data.title}</p>
            <p><strong>Descrição:</strong> ${data.description}</p>
            <p><strong>Preço:</strong> R$ ${data.price}</p>
            <p><strong>Válida de:</strong> ${data.validFrom} até ${data.validTo}</p>
          `
        },
        promotion_updated: {
          subject: 'Promoção Atualizada',
          html: `
            <h2>Promoção Atualizada</h2>
            <p><strong>Título:</strong> ${data.title}</p>
            <p><strong>Descrição:</strong> ${data.description}</p>
            <p><strong>Preço:</strong> R$ ${data.price}</p>
            <p><strong>Válida de:</strong> ${data.validFrom} até ${data.validTo}</p>
          `
        },
        schedule_created: {
          subject: 'Nova Agenda Criada',
          html: `
            <h2>Nova Agenda Criada</h2>
            <p><strong>Profissional:</strong> ${data.professional?.name || 'N/A'}</p>
            <p><strong>Data:</strong> ${data.date}</p>
            <p><strong>Horário:</strong> ${data.startTime} - ${data.endTime}</p>
            <p><strong>Disponível:</strong> ${data.available ? 'Sim' : 'Não'}</p>
          `
        },
        schedule_updated: {
          subject: 'Agenda Atualizada',
          html: `
            <h2>Agenda Atualizada</h2>
            <p><strong>Profissional:</strong> ${data.professional?.name || 'N/A'}</p>
            <p><strong>Data:</strong> ${data.date}</p>
            <p><strong>Horário:</strong> ${data.startTime} - ${data.endTime}</p>
            <p><strong>Disponível:</strong> ${data.available ? 'Sim' : 'Não'}</p>
          `
        }
      };

      const template = templates[type];
      if (!template) return;

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: template.subject,
        html: template.html
      });

      console.log(`Email enviado: ${template.subject}`);
    } catch (error) {
      console.error('Erro ao enviar email:', error.message);
    }
  }
}

module.exports = new EmailService();