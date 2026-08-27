package com.timeright.tcc.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.FuncionarioServico;
import com.timeright.tcc.model.entity.FuncionarioServicoId;

public interface FuncionarioServicoRepository
        extends JpaRepository<FuncionarioServico, FuncionarioServicoId> {

    List<FuncionarioServico> findByIdFuncionarioId(Long funcionarioId);

    List<FuncionarioServico> findByIdServicoId(Long servicoId);

    @Query("SELECT fs.funcionario FROM FuncionarioServico fs WHERE fs.id.servicoId = :servicoId")
    List<Funcionario> findFuncionariosByServicoId(@Param("servicoId") Long servicoId);

    boolean existsByIdFuncionarioIdAndIdServicoId(Long funcionarioId, Long servicoId);

    long deleteByIdFuncionarioId(Long funcionarioId);

    long deleteByIdServicoId(Long servicoId);
}
