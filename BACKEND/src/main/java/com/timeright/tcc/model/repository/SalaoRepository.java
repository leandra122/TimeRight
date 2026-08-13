package com.timeright.tcc.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.timeright.tcc.model.entity.Salao;

public interface SalaoRepository extends JpaRepository<Salao, Long> {
    List<Salao> findByGerenteId(Long gerenteId);

    boolean existsByIdAndGerenteId(Long salaoId, Long gerenteId);
}
