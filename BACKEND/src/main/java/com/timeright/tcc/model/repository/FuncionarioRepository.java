package com.timeright.tcc.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.timeright.tcc.model.entity.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByEmail(String email);

    Optional<Funcionario> findByUsuarioId(Long usuarioId);

    List<Funcionario> findBySalaoGerenteId(Long gerenteId);

    Optional<Funcionario> findByIdAndSalaoGerenteId(Long id, Long gerenteId);

    boolean existsByIdAndSalaoGerenteId(Long id, Long gerenteId);

    long countBySalaoIdAndStatus(Long salaoId, String status);

    long countByStatus(String status);
}
