package com.alimentandoofuturo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${admin.email:rm94720@estudante.fieb.edu.br}")
    private String adminEmail;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void sendSupportRequest(String name, String email, String subject, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(adminEmail);
        mailMessage.setSubject("Nova Solicitação de Suporte: " + subject);
        mailMessage.setText(
            "Nova solicitação de suporte recebida:\n\n" +
            "Nome: " + name + "\n" +
            "E-mail: " + email + "\n" +
            "Assunto: " + subject + "\n" +
            "Mensagem: " + message + "\n\n" +
            "Data: " + java.time.LocalDateTime.now()
        );
        mailMessage.setFrom("noreply@timeright.com");
        
        mailSender.send(mailMessage);
    }
    
    public void sendPasswordResetToken(String email, String token) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("Código de Redefinição de Senha - Time Right");
        mailMessage.setText(
            "Olá,\n\n" +
            "Você solicitou a redefinição de sua senha.\n\n" +
            "Seu código de redefinição é: " + token + "\n\n" +
            "Este código expira em 15 minutos.\n\n" +
            "Se você não solicitou esta redefinição, ignore este e-mail.\n\n" +
            "Equipe Time Right"
        );
        mailMessage.setFrom("noreply@timeright.com");
        
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