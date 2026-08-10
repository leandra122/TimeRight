package com.timeright.tcc.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 255)
    private String descricao;

    @Column(nullable = false)
    private Double preco;

    @Column(nullable = false)
    private Integer duracao;

    @Column(nullable = false, length = 10)
    private String status;

    @ManyToOne
    @JoinColumn(name = "salao_id", nullable = false)
    private Salao salao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Double getPreco() { return preco; }
    public void setPreco(Double preco) { this.preco = preco; }

    public Integer getDuracao() { return duracao; }
    public void setDuracao(Integer duracao) { this.duracao = duracao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Salao getSalao() { return salao; }
    public void setSalao(Salao salao) { this.salao = salao; }
}
