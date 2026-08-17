package com.timeright.tcc.model.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.timeright.tcc.model.entity.Agendamento;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.funcionario.id = :funcionarioId
          AND a.funcionario.salao.id = a.servico.salao.id
        ORDER BY a.dataHora ASC, a.id ASC
        """)
    List<Agendamento> buscarAgendaEmployeeComVinculosConsistentes(
            @Param("funcionarioId") Long funcionarioId);

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.funcionario.salao.gerente.id = :gerenteId
          AND a.funcionario.salao.id = a.servico.salao.id
        """)
    List<Agendamento> buscarPorGerenteComVinculosConsistentes(@Param("gerenteId") Long gerenteId);

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.id = :id
          AND a.funcionario.salao.gerente.id = :gerenteId
          AND a.funcionario.salao.id = a.servico.salao.id
        """)
    Optional<Agendamento> buscarPorIdEGerenteComVinculosConsistentes(
            @Param("id") Long id, @Param("gerenteId") Long gerenteId);

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.usuario.id = :usuarioId
          AND a.funcionario.salao.id = a.servico.salao.id
        ORDER BY a.dataHora DESC, a.id DESC
        """)
    List<Agendamento> buscarClienteComVinculosConsistentes(@Param("usuarioId") Long usuarioId);

    @Query(value = """
        SELECT COUNT(*)
        FROM Agendamento a
        WHERE a.funcionario_id = :funcionarioId
          AND a.status <> 'CANCELADO'
          AND a.data_hora < :fim
          AND DATEADD(MINUTE,
                CASE WHEN a.duracao IS NULL OR a.duracao <= 0 THEN 1440 ELSE a.duracao END,
                a.data_hora) > :inicio
        """, nativeQuery = true)
    long contarConflitosCliente(
            @Param("funcionarioId") Long funcionarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);

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
