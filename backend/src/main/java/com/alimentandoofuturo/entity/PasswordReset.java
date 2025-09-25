package com.alimentandoofuturo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset")
public class PasswordReset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String codigo;
    
    @Column(nullable = false)
    private LocalDateTime expiracao;
    
    @Column(nullable = false)
    private boolean usado = false;
    
    public PasswordReset() {}
    
    public PasswordReset(String email, String codigo, LocalDateTime expiracao) {
        this.email = email;
        this.codigo = codigo;
        this.expiracao = expiracao;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public LocalDateTime getExpiracao() { return expiracao; }
    public void setExpiracao(LocalDateTime expiracao) { this.expiracao = expiracao; }
    
    public boolean isUsado() { return usado; }
    public void setUsado(boolean usado) { this.usado = usado; }
}