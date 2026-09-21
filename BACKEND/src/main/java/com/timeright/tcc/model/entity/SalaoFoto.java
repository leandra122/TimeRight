package com.timeright.tcc.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "SalaoFoto")
public class SalaoFoto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "salao_id", nullable = false)
    private Long salaoId;
    @Column(nullable = false, columnDefinition = "varbinary(max)")
    private byte[] conteudo;
    @Column(nullable = false, length = 20)
    private String tipo;
    @Column(nullable = false)
    private boolean principal;
    public Long getId() { return id; }
    public Long getSalaoId() { return salaoId; }
    public void setSalaoId(Long valor) { salaoId = valor; }
    public byte[] getConteudo() { return conteudo; }
    public void setConteudo(byte[] valor) { conteudo = valor; }
    public String getTipo() { return tipo; }
    public void setTipo(String valor) { tipo = valor; }
    public boolean isPrincipal() { return principal; }
    public void setPrincipal(boolean valor) { principal = valor; }
}
