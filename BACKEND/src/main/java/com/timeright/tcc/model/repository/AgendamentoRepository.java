package com.timeright.tcc.model.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.timeright.tcc.model.entity.Agendamento;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByUsuarioId(Long usuarioId);

    List<Agendamento> findByFuncionarioId(Long funcionarioId);

    long countByUsuarioIdAndStatus(Long usuarioId, String status);

    @Query("SELECT COUNT(a) FROM Agendamento a WHERE a.dataHora >= :inicio AND a.dataHora < :fim AND a.status <> 'CANCELADO'")
    long countByDataHoraBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(a) FROM Agendamento a WHERE a.status = :status")
    long countByStatus(@Param("status") String status);

    @Query(value = """
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM Agendamento a
        WHERE a.funcionario_id = :funcionarioId
        AND a.status <> 'CANCELADO'
        AND a.data_hora < :fim
        AND DATEADD(MINUTE, a.duracao, a.data_hora) > :inicio
        AND (:id IS NULL OR a.id <> :id)
    """, nativeQuery = true)
    boolean existeConflitoIntervalo(
            @Param("funcionarioId") Long funcionarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("id") Long id
    );
}