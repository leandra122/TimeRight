package com.timeright.tcc.model.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class FuncionarioServicoId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "funcionario_id", nullable = false)
    private Long funcionarioId;

    @Column(name = "servico_id", nullable = false)
    private Long servicoId;

    protected FuncionarioServicoId() {
    }

    public FuncionarioServicoId(Long funcionarioId, Long servicoId) {
        this.funcionarioId = funcionarioId;
        this.servicoId = servicoId;
    }

    public Long getFuncionarioId() { return funcionarioId; }
    public Long getServicoId() { return servicoId; }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto) return true;
        if (!(objeto instanceof FuncionarioServicoId outro)) return false;
        return Objects.equals(funcionarioId, outro.funcionarioId)
                && Objects.equals(servicoId, outro.servicoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(funcionarioId, servicoId);
    }
}
