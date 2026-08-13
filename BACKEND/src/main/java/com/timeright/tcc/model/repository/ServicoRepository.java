package com.timeright.tcc.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.timeright.tcc.model.entity.Servico;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findBySalaoId(Long salaoId);

    List<Servico> findBySalaoGerenteId(Long gerenteId);

    Optional<Servico> findByIdAndSalaoGerenteId(Long id, Long gerenteId);

    boolean existsByIdAndSalaoGerenteId(Long id, Long gerenteId);

    long countBySalaoIdAndStatus(Long salaoId, String status);
}
