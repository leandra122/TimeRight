package com.timeright.tcc.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EmployeeLifecycleIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;

    private Usuario manager;
    private Usuario outroManager;
    private NivelAcesso employee;
    private Salao salao;
    private Salao salaoAlheio;

    @BeforeEach
    void setup() {
        employee = nivel("employee", "ATIVO");
        NivelAcesso managerRole = nivel("manager", "ATIVO");
        manager = usuario("Gerente", "manager-employee@teste.com", managerRole, "ATIVO");
        outroManager = usuario("Outro", "outro-employee@teste.com", managerRole, "ATIVO");
        salao = salao("Próprio", "04252011000110", manager);
        salaoAlheio = salao("Alheio", "40688134000161", outroManager);
    }

    @Test
    void cadastroCriaContaEmployeeNormalizadaComMesmoHashELoginValido() throws Exception {
        mockMvc.perform(post("/funcionarios/{id}", salao.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("  Funcionária Teste  ", "  FUNCIONARIA@TESTE.COM  ",
                                "senha123", salaoAlheio.getId(), outroManager.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Funcionária Teste"))
                .andExpect(jsonPath("$.email").value("funcionaria@teste.com"))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.usuario").doesNotExist())
                .andExpect(jsonPath("$.salao.id").value(salao.getId()));

        Funcionario funcionario = funcionarioRepository.findByEmail("funcionaria@teste.com").orElseThrow();
        Usuario conta = funcionario.getUsuario();
        assertNotNull(conta);
        assertEquals("employee", conta.getNivelAcesso().getNome());
        assertEquals("ATIVO", conta.getStatusUsuario());
        assertEquals(funcionario.getSenha(), conta.getPassword());
        assertNotEquals("senha123", conta.getPassword());
        assertTrue(passwordEncoder.matches("senha123", conta.getPassword()));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\" FUNCIONARIA@TESTE.COM \",\"senha\":\"senha123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }

    @Test
    void duplicidadesEmUsuarioOuFuncionarioRetornamConflito() throws Exception {
        usuario("Existente", "duplicado-usuario@teste.com", employee, "ATIVO");
        Funcionario existente = funcionarioLegado("Legado", "duplicado-funcionario@teste.com", salao);
        assertNotNull(existente);

        cadastrarEsperandoConflito("duplicado-usuario@teste.com");
        cadastrarEsperandoConflito("duplicado-funcionario@teste.com");
    }

    @Test
    void gerenteNaoCadastraEmSalaoAlheio() throws Exception {
        mockMvc.perform(post("/funcionarios/{id}", salaoAlheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("Funcionária", "alheia@teste.com", "senha123", null, null)))
                .andExpect(status().isForbidden());
    }

    @Test
    void atualizacaoSincronizaEmailSenhaENaoAceitaAssociacoesDoPayload() throws Exception {
        Funcionario funcionario = cadastrar("original@teste.com");
        String hashAnterior = funcionario.getSenha();

        mockMvc.perform(put("/funcionarios/{id}", funcionario.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("Nome Atualizado", " NOVO@TESTE.COM ", "novaSenha",
                                salaoAlheio.getId(), outroManager.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario").doesNotExist());

        Funcionario atualizado = funcionarioRepository.findById(funcionario.getId()).orElseThrow();
        assertEquals("novo@teste.com", atualizado.getEmail());
        assertEquals("novo@teste.com", atualizado.getUsuario().getUsername());
        assertEquals(atualizado.getSenha(), atualizado.getUsuario().getPassword());
        assertNotEquals(hashAnterior, atualizado.getSenha());
        assertEquals(salao.getId(), atualizado.getSalao().getId());
        assertEquals("employee", atualizado.getUsuario().getNivelAcesso().getNome());
    }

    @Test
    void statusEExclusaoLogicaSincronizamContaEPreservamRegistro() throws Exception {
        Funcionario funcionario = cadastrar("ciclo@teste.com");

        alterarStatus(funcionario.getId(), "INATIVO");
        assertStatusSincronizado(funcionario.getId(), "INATIVO");
        alterarStatus(funcionario.getId(), "ATIVO");
        assertStatusSincronizado(funcionario.getId(), "ATIVO");

        mockMvc.perform(delete("/funcionarios/{id}", funcionario.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Funcionário inativado; histórico preservado"));
        assertStatusSincronizado(funcionario.getId(), "INATIVO");
        assertTrue(funcionarioRepository.existsById(funcionario.getId()));
    }

    @Test
    void funcionarioLegadoNaoRecebeVinculoAutomatico() throws Exception {
        Funcionario legado = funcionarioLegado("Legado", "legado-sem-conta@teste.com", salao);
        mockMvc.perform(patch("/funcionarios/{id}/status", legado.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INATIVO\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Funcionário legado sem conta de usuário vinculada"));
        org.junit.jupiter.api.Assertions.assertNull(
                funcionarioRepository.findById(legado.getId()).orElseThrow().getUsuario());
    }

    private Funcionario cadastrar(String email) throws Exception {
        mockMvc.perform(post("/funcionarios/{id}", salao.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("Funcionária", email, "senha123", null, null)))
                .andExpect(status().isOk());
        return funcionarioRepository.findByEmail(email.trim().toLowerCase()).orElseThrow();
    }

    private void cadastrarEsperandoConflito(String email) throws Exception {
        mockMvc.perform(post("/funcionarios/{id}", salao.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("Duplicada", email, "senha123", null, null)))
                .andExpect(status().isConflict());
    }

    private void alterarStatus(Long id, String statusValue) throws Exception {
        mockMvc.perform(patch("/funcionarios/{id}/status", id)
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"" + statusValue + "\"}"))
                .andExpect(status().isOk());
    }

    private void assertStatusSincronizado(Long id, String statusValue) {
        Funcionario atual = funcionarioRepository.findById(id).orElseThrow();
        assertEquals(statusValue, atual.getStatus());
        assertEquals(statusValue, atual.getUsuario().getStatusUsuario());
    }

    private Funcionario funcionarioLegado(String nome, String email, Salao salaoValue) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha("hash-ficticio");
        funcionario.setFuncao("Cabeleireira");
        funcionario.setStatus("ATIVO");
        funcionario.setSalao(salaoValue);
        return funcionarioRepository.save(funcionario);
    }

    private NivelAcesso nivel(String nome, String statusValue) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso(statusValue);
        return nivelAcessoRepository.save(nivel);
    }

    private Usuario usuario(String nome, String email, NivelAcesso nivel, String statusValue) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(email);
        usuario.setPassword(passwordEncoder.encode("senha-teste"));
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario(statusValue);
        return usuarioRepository.save(usuario);
    }

    private Salao salao(String nome, String cnpj, Usuario gerente) {
        Salao salaoValue = new Salao();
        salaoValue.setNome(nome);
        salaoValue.setCnpj(cnpj);
        salaoValue.setEmail(cnpj + "@teste.com");
        salaoValue.setEndereco("Rua Teste, 1");
        salaoValue.setTelefone("11999999999");
        salaoValue.setStatus("ATIVO");
        salaoValue.setGerente(gerente);
        return salaoRepository.save(salaoValue);
    }

    private String payload(String nome, String email, String senha, Long salaoId, Long usuarioId) {
        String malicioso = salaoId == null ? "" : ",\"salao\":{\"id\":" + salaoId + "}"
                + ",\"usuario\":{\"id\":" + usuarioId + ",\"statusUsuario\":\"ATIVO\","
                + "\"nivelAcesso\":{\"nome\":\"ADMIN\"}},\"status\":\"INATIVO\"";
        return "{\"nome\":\"" + nome + "\",\"email\":\"" + email
                + "\",\"senha\":\"" + senha + "\",\"funcao\":\"Cabeleireira\""
                + malicioso + "}";
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
