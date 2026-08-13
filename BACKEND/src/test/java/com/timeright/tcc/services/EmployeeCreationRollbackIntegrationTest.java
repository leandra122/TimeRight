package com.timeright.tcc.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class EmployeeCreationRollbackIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;

    @Test
    void falhaAoSalvarFuncionarioNaoDeixaUsuarioOrfao() {
        NivelAcesso employee = nivel("employee");
        NivelAcesso managerRole = nivel("manager");
        nivelAcessoRepository.save(employee);
        managerRole = nivelAcessoRepository.save(managerRole);

        Usuario manager = new Usuario();
        manager.setNome("Gerente Rollback");
        manager.setUsername("manager-rollback@teste.com");
        manager.setPassword(passwordEncoder.encode("senha123"));
        manager.setNivelAcesso(managerRole);
        manager.setStatusUsuario("ATIVO");
        manager = usuarioRepository.save(manager);

        Salao salao = new Salao();
        salao.setNome("Salão Rollback");
        salao.setCnpj("04252011000110");
        salao.setEmail("rollback@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setGerente(manager);
        salao = salaoRepository.save(salao);

        String authorization = "Bearer " + jwtService.emitirToken(manager);
        Long salaoId = salao.getId();
        assertThrows(Exception.class, () -> mockMvc.perform(post("/funcionarios/{id}", salaoId)
                .header("Authorization", authorization)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Funcionária Rollback\","
                        + "\"email\":\"rollback-func@teste.com\","
                        + "\"senha\":\"senha123\"}")));

        assertTrue(usuarioRepository.findByUsername("rollback-func@teste.com").isEmpty());
    }

    private NivelAcesso nivel(String nome) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso("ATIVO");
        return nivel;
    }
}
