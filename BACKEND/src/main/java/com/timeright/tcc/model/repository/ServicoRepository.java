package com.timeright.tcc.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.timeright.tcc.model.entity.Servico;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    List<Servico> findBySalaoId(Long salaoId);

    long countBySalaoIdAndStatus(Long salaoId, String status);
}
