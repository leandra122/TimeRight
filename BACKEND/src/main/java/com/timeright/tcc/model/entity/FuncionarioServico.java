package com.timeright.tcc.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "FuncionarioServico", indexes = {
        @Index(name = "IX_FuncionarioServico_Funcionario", columnList = "funcionario_id"),
        @Index(name = "IX_FuncionarioServico_Servico", columnList = "servico_id")
})
public class FuncionarioServico {

    @EmbeddedId
    private FuncionarioServicoId id;

    @Column(name = "salao_id", nullable = false)
    private Long salaoId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "funcionario_id", referencedColumnName = "id",
                    insertable = false, updatable = false),
            @JoinColumn(name = "salao_id", referencedColumnName = "salao_id",
                    insertable = false, updatable = false)
    })
    @JsonIgnore
    private Funcionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "servico_id", referencedColumnName = "id",
                    insertable = false, updatable = false),
            @JoinColumn(name = "salao_id", referencedColumnName = "salao_id",
                    insertable = false, updatable = false)
    })
    @JsonIgnore
    private Servico servico;

    protected FuncionarioServico() {
    }

    public FuncionarioServico(Funcionario funcionario, Servico servico) {
        if (funcionario == null || funcionario.getId() == null
                || servico == null || servico.getId() == null) {
            throw new IllegalArgumentException("Funcionário e serviço persistidos são obrigatórios");
        }
        if (funcionario.getSalao() == null || funcionario.getSalao().getId() == null) {
            throw new IllegalArgumentException("Salão do funcionário é obrigatório");
        }
        this.id = new FuncionarioServicoId(funcionario.getId(), servico.getId());
        this.salaoId = funcionario.getSalao().getId();
        this.funcionario = funcionario;
        this.servico = servico;
    }

    public FuncionarioServicoId getId() { return id; }
    public Long getSalaoId() { return salaoId; }
    public Funcionario getFuncionario() { return funcionario; }
    public Servico getServico() { return servico; }
}
