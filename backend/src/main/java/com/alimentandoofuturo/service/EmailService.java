package com.alimentandoofuturo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendPasswordResetCode(String email, String codigo) {
        // Mock - em produção configuraria SMTP real
        // Log sanitizado para evitar injection
        if (email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            // Email válido, pode logar
        }
    }
    
    public void sendPasswordResetToken(String email, String token) {
        sendPasswordResetCode(email, token);
    }
    
    public void sendAppointmentConfirmation(Object appointment) {
        System.out.println("Confirmação de agendamento enviada");
    }
    
    public void sendSupportRequest(String name, String email, String subject, String message) {
        System.out.println("Solicitação de suporte enviada: " + subject);
    }
}