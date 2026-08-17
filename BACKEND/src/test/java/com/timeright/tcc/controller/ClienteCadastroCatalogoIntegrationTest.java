package com.timeright.tcc.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Map;

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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ClienteCadastroCatalogoIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;

    @BeforeEach
    void prepararNiveis() {
        nivel("user", "ATIVO");
        nivel("manager", "ATIVO");
        nivel("employee", "ATIVO");
    }

    @Test
    void cadastroValidoNormalizaCriaUserComBcryptEPermiteLogin() throws Exception {
        String body = """
                {"nome":"  Cliente Teste  ","email":"  CLIENTE.NOVO@TESTE.COM  ",
                 "password":"senha-segura"}
                """;

        String response = mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Cliente Teste"))
                .andExpect(jsonPath("$.email").value("cliente.novo@teste.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.status").value("ATIVO"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.resetToken").doesNotExist())
                .andExpect(jsonPath("$.resetTokenExpiracao").doesNotExist())
                .andExpect(jsonPath("$.nivelAcesso").doesNotExist())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        Usuario salvo = usuarioRepository.findById(json.get("id").asLong()).orElseThrow();
        assertThat(salvo.getNivelAcesso().getNome()).isEqualToIgnoringCase("user");
        assertThat(passwordEncoder.matches("senha-segura", salvo.getPassword())).isTrue();
        assertThat(salvo.getPassword()).startsWith("$2");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"cliente.novo@teste.com\",\"senha\":\"senha-segura\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void payloadProtegidoNaoEscolheIdentidadeStatusOuPerfil() throws Exception {
        String body = """
                {"id":999,"nome":"Cliente Seguro","email":"seguro@teste.com",
                 "password":"senha-segura","role":"ADMIN","status":"INATIVO",
                 "nivelAcesso":{"id":1,"nome":"ADMIN"}}
                """;

        String response = mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(999)))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.status").value("ATIVO"))
                .andReturn().getResponse().getContentAsString();

        Usuario salvo = usuarioRepository.findById(
                objectMapper.readTree(response).get("id").asLong()).orElseThrow();
        assertThat(salvo.getNivelAcesso().getNome()).isEqualToIgnoringCase("user");
        assertThat(salvo.getStatusUsuario()).isEqualTo("ATIVO");
    }

    @Test
    void duplicidadeRetornaConflitoEValidacoesRetornamBadRequest() throws Exception {
        String valido = cadastro("Cliente", "duplicado@teste.com", "123456");
        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON).content(valido))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON).content(valido))
                .andExpect(status().isConflict());

        esperarCadastroInvalido(cadastro(" ", "nome@teste.com", "123456"));
        esperarCadastroInvalido(cadastro("Cliente", "email-invalido", "123456"));
        esperarCadastroInvalido(cadastro("Cliente", "senha@teste.com", "123"));
    }

    @Test
    void cadastroLegadoDeGerentePermaneceInalterado() throws Exception {
        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Gerente Web\",\"username\":\"gerente.web@teste.com\",\"password\":\"123456\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nivelAcesso.nome").value("manager"));

        Usuario gerente = usuarioRepository.findByUsername("gerente.web@teste.com").orElseThrow();
        assertThat(gerente.getNivelAcesso().getNome()).isEqualToIgnoringCase("manager");
    }

    @Test
    void catalogoPublicoFiltraSalaoStatusOrdenaEDivulgaSomenteDto() throws Exception {
        Salao principal = salao("Salao Principal", "ATIVO", "10000000000100");
        Salao outro = salao("Outro Salao", "ATIVO", "10000000000200");

        Funcionario ana2 = funcionario("Ana", "ana2@teste.com", "Cabeleireira", "ATIVO", principal);
        Funcionario ana1 = funcionario("Ana", "ana1@teste.com", "Manicure", "ATIVO", principal);
        Funcionario zeca = funcionario("Zeca", "zeca@teste.com", "Barbeiro", "ATIVO", principal);
        Funcionario inativo = funcionario("Bia", "bia@teste.com", "Esteticista", "INATIVO", principal);
        Funcionario externo = funcionario("Carlos", "carlos@teste.com", "Barbeiro", "ATIVO", outro);
        assertThat(inativo.getId()).isNotNull();
        assertThat(externo.getId()).isNotNull();

        long primeiroId = Math.min(ana1.getId(), ana2.getId());
        long segundoId = Math.max(ana1.getId(), ana2.getId());

        mockMvc.perform(get("/catalogo/saloes/{id}/funcionarios", principal.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value(primeiroId))
                .andExpect(jsonPath("$[1].id").value(segundoId))
                .andExpect(jsonPath("$[2].id").value(zeca.getId()))
                .andExpect(jsonPath("$[2].nome").value("Zeca"))
                .andExpect(jsonPath("$[0].salaoId").value(principal.getId()))
                .andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].senha").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist())
                .andExpect(jsonPath("$[0].usuario").doesNotExist())
                .andExpect(jsonPath("$[0].observacoes").doesNotExist())
                .andExpect(jsonPath("$[0].salao").doesNotExist());
    }

    @Test
    void catalogoIndisponivelRetorna404EListagemGlobalContinuaProtegida() throws Exception {
        Salao inativo = salao("Salao Inativo", "INATIVO", "10000000000300");

        mockMvc.perform(get("/catalogo/saloes/{id}/funcionarios", 999999L))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/catalogo/saloes/{id}/funcionarios", inativo.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/funcionarios"))
                .andExpect(status().isUnauthorized());
    }

    private void esperarCadastroInvalido(String body) throws Exception {
        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    private String cadastro(String nome, String email, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "nome", nome, "email", email, "password", password));
    }

    private NivelAcesso nivel(String nome, String status) {
        NivelAcesso nivel = nivelAcessoRepository.findByNomeIgnoreCase(nome)
                .orElseGet(NivelAcesso::new);
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso(status);
        return nivelAcessoRepository.save(nivel);
    }

    private Salao salao(String nome, String status, String cnpj) {
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(cnpj);
        salao.setEmail(nome.toLowerCase().replace(' ', '.') + "@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus(status);
        return salaoRepository.saveAndFlush(salao);
    }

    private Funcionario funcionario(String nome, String email, String funcao,
                                    String status, Salao salao) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha(passwordEncoder.encode("123456"));
        funcionario.setObservacoes("informação interna");
        funcionario.setFuncao(funcao);
        funcionario.setStatus(status);
        funcionario.setSalao(salao);
        funcionario.setUsuario(usuarioFuncionario(nome, email));
        return funcionarioRepository.saveAndFlush(funcionario);
    }

    private Usuario usuarioFuncionario(String nome, String email) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(email);
        usuario.setPassword(passwordEncoder.encode("123456"));
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setNivelAcesso(nivelAcessoRepository.findByNomeIgnoreCase("employee").orElseThrow());
        usuario.setStatusUsuario("ATIVO");
        return usuarioRepository.saveAndFlush(usuario);
    }
}
