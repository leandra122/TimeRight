package com.timeright.tcc.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.timeright.tcc.model.entity.HorarioFuncionamentoSalao;

public interface HorarioFuncionamentoSalaoRepository
        extends JpaRepository<HorarioFuncionamentoSalao, Long> {

    List<HorarioFuncionamentoSalao> findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(
            Long salaoId);

    List<HorarioFuncionamentoSalao> findBySalaoIdAndDiaSemanaOrderByHoraInicioAscIdAsc(
            Long salaoId, Integer diaSemana);

    void deleteBySalaoId(Long salaoId);
}
