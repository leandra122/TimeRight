package com.timeright.tcc.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.timeright.tcc.model.entity.Funcionario;

import jakarta.persistence.LockModeType;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Funcionario> findByUsuarioId(Long usuarioId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Funcionario f JOIN FETCH f.salao WHERE f.id = :id")
    Optional<Funcionario> findByIdForUpdate(@Param("id") Long id);

    List<Funcionario> findBySalaoGerenteId(Long gerenteId);

    List<Funcionario> findBySalaoIdAndStatusIgnoreCaseOrderByNomeAscIdAsc(
            Long salaoId, String status);

    Optional<Funcionario> findByIdAndSalaoGerenteId(Long id, Long gerenteId);

    boolean existsByIdAndSalaoGerenteId(Long id, Long gerenteId);

    long countBySalaoIdAndStatus(Long salaoId, String status);

    long countByStatus(String status);
}
