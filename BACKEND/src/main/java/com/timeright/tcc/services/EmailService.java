package com.timeright.tcc.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmail(String para, String token) {
        String link = "http://localhost:8080/api/auth/confirmar?token=" + token;

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(para);
        mensagem.setSubject("Confirmação de Email");
        mensagem.setText("Clique no link para confirmar sua conta:\n" + link);

        mailSender.send(mensagem);
    }
}
