package com.alimentandoofuturo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SupportRequest {
    @NotBlank(message = "Nome é obrigatório")
    private String name;
    
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail deve ser válido")
    private String email;
    
    @NotBlank(message = "Assunto é obrigatório")
    private String subject;
    
    @NotBlank(message = "Mensagem é obrigatória")
    private String message;
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}