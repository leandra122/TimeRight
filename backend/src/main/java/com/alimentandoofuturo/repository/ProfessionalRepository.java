package com.alimentandoofuturo.repository;

import com.alimentandoofuturo.entity.Professional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessionalRepository extends JpaRepository<Professional, Long> {
    List<Professional> findByActiveTrue();
    Optional<Professional> findByIdAndActiveTrue(Long id);
}