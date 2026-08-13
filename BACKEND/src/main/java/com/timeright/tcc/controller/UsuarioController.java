package com.timeright.tcc.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.services.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // =========================
    // LISTAR
    // =========================
    @GetMapping
    public ResponseEntity<List<Usuario>> findAll() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // =========================
    // LISTAR CLIENTES (apenas USER — para o Painel de agendamentos)
    // =========================
    @GetMapping("/clientes")
    public ResponseEntity<List<Usuario>> findClientes() {
        return ResponseEntity.ok(usuarioService.listarClientes());
    }

    // =========================
    // BUSCAR POR ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable String id) {

        try {
            Long idLong = Long.parseLong(id);
            return ResponseEntity.ok(usuarioService.findById(idLong));

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "ID inválido: " + id)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // =========================
    // CADASTRAR
    // =========================
    @PostMapping
    public ResponseEntity<Object> save(@RequestBody Usuario usuario) {

        try {
            Usuario novo = usuarioService.salvar(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(novo);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Erro interno")
            );
        }
    }

    // =========================
    // ATUALIZAR
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable String id,
                                           @RequestBody Usuario usuario) {

        try {
            Long idLong = Long.parseLong(id);
            return ResponseEntity.ok(usuarioService.atualizar(idLong, usuario));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    // =========================
    // STATUS
    // =========================
    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> atualizarStatus(@PathVariable String id,
                                                  @RequestBody Map<String, String> body) {

        try {
            Long idLong = Long.parseLong(id);
            String status = body.get("status");

            Usuario atualizado = usuarioService.atualizarStatus(idLong, status);

            return ResponseEntity.ok(atualizado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    // =========================
    // DELETAR
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable String id) {

        try {
            Long idLong = Long.parseLong(id);
            usuarioService.deletar(idLong);

            return ResponseEntity.ok(
                    Map.of("message", "Usuário deletado com sucesso")
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    // =========================
    // RECUPERAÇÃO DE SENHA (MOCK)
    // =========================
    @PostMapping("/esqueci-senha")
    public ResponseEntity<Object> esqueceuSenha(@RequestBody Map<String, String> body) {
        try {
            usuarioService.solicitarResetSenha(body.get("username"));
            return ResponseEntity.ok(
                    Map.of("message", "Se o e-mail existir, o token foi registrado no console."));
        } catch (RuntimeException e) {
            // Retorna a mesma mensagem genérica para não revelar se o e-mail existe
            return ResponseEntity.ok(
                    Map.of("message", "Se o e-mail existir, o token foi registrado no console."));
        }
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Object> redefinirSenha(@RequestBody Map<String, String> body) {
        try {
            usuarioService.redefinirSenha(body.get("token"), body.get("novaSenha"));
            return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
