package com.alimentandoofuturo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${admin.email:rm94877@estudante.fieb.edu.br}")
    private String adminEmail;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void sendSupportRequest(String name, String email, String subject, String message) {
        // E-mail para admin
        SimpleMailMessage adminMessage = new SimpleMailMessage();
        adminMessage.setTo(adminEmail);
        adminMessage.setSubject("🎯 TimeRight - Nova Solicitação: " + subject);
        adminMessage.setText(
            "═══════════════════════════════════════\n" +
            "         NOVA SOLICITAÇÃO DE SUPORTE\n" +
            "═══════════════════════════════════════\n\n" +
            "👤 Nome: " + name + "\n" +
            "📧 E-mail: " + email + "\n" +
            "📋 Assunto: " + subject + "\n\n" +
            "💬 Mensagem:\n" +
            "───────────────────────────────────────\n" +
            message + "\n" +
            "───────────────────────────────────────\n\n" +
            "🕐 Recebido em: " + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "\n\n" +
            "TimeRight - Sistema de Agendamento"
        );
        adminMessage.setReplyTo(email);
        
        // E-mail de confirmação para usuário
        SimpleMailMessage userMessage = new SimpleMailMessage();
        userMessage.setTo(email);
        userMessage.setSubject("✅ TimeRight - Solicitação Recebida");
        userMessage.setText(
            "Olá " + name + ",\n\n" +
            "Recebemos sua solicitação de suporte com sucesso!\n\n" +
            "📋 Assunto: " + subject + "\n" +
            "🕐 Recebido em: " + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "\n\n" +
            "Nossa equipe analisará sua mensagem e retornará em breve.\n\n" +
            "Obrigado por escolher o TimeRight!\n\n" +
            "═══════════════════════════════════════\n" +
            "TimeRight - Seu tempo, nossa prioridade\n" +
            "═══════════════════════════════════════"
        );
        
        mailSender.send(adminMessage);
        mailSender.send(userMessage);
    }
    
    public void sendPasswordResetToken(String email, String token) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("🔐 TimeRight - Código de Recuperação");
        mailMessage.setText(
            "═══════════════════════════════════════\n" +
            "         RECUPERAÇÃO DE SENHA\n" +
            "═══════════════════════════════════════\n\n" +
            "Olá,\n\n" +
            "Você solicitou a recuperação de sua senha no TimeRight.\n\n" +
            "🔑 SEU CÓDIGO DE VERIFICAÇÃO:\n\n" +
            "        " + token + "\n\n" +
            "⏰ IMPORTANTE:\n" +
            "• Este código expira em 10 minutos\n" +
            "• Use apenas uma vez\n" +
            "• Não compartilhe com ninguém\n\n" +
            "Se você não solicitou esta recuperação, ignore este e-mail.\n" +
            "Sua conta permanecerá segura.\n\n" +
            "═══════════════════════════════════════\n" +
            "TimeRight - Seu tempo, nossa prioridade\n" +
            "═══════════════════════════════════════"
        );
        
        mailSender.send(mailMessage);
    }
    
    public void sendAppointmentConfirmation(com.alimentandoofuturo.entity.Appointment appointment) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(appointment.getClient().getEmail());
        mailMessage.setSubject("Confirmação de Agendamento - Time Right");
        mailMessage.setText(
            "Olá " + appointment.getClient().getName() + ",\n\n" +
            "Seu agendamento foi confirmado com sucesso!\n\n" +
            "Detalhes do agendamento:\n" +
            "Serviço: " + appointment.getCategory().getName() + "\n" +
            "Profissional: " + appointment.getProfessional().getName() + "\n" +
            "Data e Hora: " + appointment.getAppointmentDate() + "\n" +
            "Status: " + appointment.getStatus() + "\n\n" +
            "Aguardamos você no Time Right!\n\n" +
            "Equipe Time Right"
        );
        mailMessage.setFrom("noreply@timeright.com");
        
        mailSender.send(mailMessage);
    }
}