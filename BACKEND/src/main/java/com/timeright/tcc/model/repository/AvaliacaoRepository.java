package com.timeright.tcc.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.timeright.tcc.model.entity.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    List<Avaliacao> findBySalaoId(Long salaoId);

    List<Avaliacao> findByUsuarioId(Long usuarioId);

    boolean existsByAgendamentoId(Long agendamentoId);

    @Query("SELECT AVG(a.nota) FROM Avaliacao a WHERE a.salao.id = :salaoId")
    Double mediaNotasBySalaoId(@Param("salaoId") Long salaoId);

    @Query("SELECT COUNT(a) FROM Avaliacao a WHERE a.salao.id = :salaoId")
    Long totalAvaliacoesBySalaoId(@Param("salaoId") Long salaoId);

    @Query("SELECT AVG(a.nota) FROM Avaliacao a")
    Double mediaGeralNotas();

    @Query("SELECT COUNT(a) FROM Avaliacao a")
    Long totalAvaliacoes();
}
