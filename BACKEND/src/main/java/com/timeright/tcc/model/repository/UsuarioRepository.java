package com.timeright.tcc.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.timeright.tcc.model.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByResetToken(String resetToken);

    @Query("SELECT u FROM Usuario u WHERE u.nivelAcesso.id <> 3")
    java.util.List<Usuario> findAllExcludingUsers();

    @Query("SELECT u FROM Usuario u WHERE u.nivelAcesso.id = 3")
    java.util.List<Usuario> findAllUsers();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.nivelAcesso.id = :nivelId AND u.statusUsuario = 'ATIVO'")
    long countByNivelAcessoIdAndStatusAtivo(@Param("nivelId") Long nivelId);
}
