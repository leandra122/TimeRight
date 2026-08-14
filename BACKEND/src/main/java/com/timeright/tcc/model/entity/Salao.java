package com.timeright.tcc.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Salao")
public class Salao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 18, unique = true)
    private String cnpj;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 200)
    private String endereco;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "antecedencia_minima_minutos", nullable = false)
    private Integer antecedenciaMinimaMinutos = 120;

    @Column(name = "limite_agendamento_dias", nullable = false)
    private Integer limiteAgendamentoDias = 60;

    @ManyToOne
    @JoinColumn(name = "gerente_id")
    @JsonIgnore
    private Usuario gerente;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAntecedenciaMinimaMinutos() { return antecedenciaMinimaMinutos; }
    public void setAntecedenciaMinimaMinutos(Integer antecedenciaMinimaMinutos) {
        this.antecedenciaMinimaMinutos = antecedenciaMinimaMinutos;
    }

    public Integer getLimiteAgendamentoDias() { return limiteAgendamentoDias; }
    public void setLimiteAgendamentoDias(Integer limiteAgendamentoDias) {
        this.limiteAgendamentoDias = limiteAgendamentoDias;
    }

    public Usuario getGerente() { return gerente; }
    public void setGerente(Usuario gerente) { this.gerente = gerente; }
}
