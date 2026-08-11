package com.timeright.tcc.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.timeright.tcc.model.entity.NivelAcesso;

import java.util.Optional;

public interface NivelAcessoRepository extends JpaRepository<NivelAcesso, Long> {
    Optional<NivelAcesso> findByNomeIgnoreCase(String nome);
}
