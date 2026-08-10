package com.timeright.tcc.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "NivelAcesso")
public class NivelAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 50)
    private String nome;

    @Column(name = "status", nullable = false, length = 50)
    private String statusNivelAcesso;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getStatusNivelAcesso() {
        return statusNivelAcesso;
    }

    public void setStatusNivelAcesso(String statusNivelAcesso) {
        this.statusNivelAcesso = statusNivelAcesso;
    }
   
    

}