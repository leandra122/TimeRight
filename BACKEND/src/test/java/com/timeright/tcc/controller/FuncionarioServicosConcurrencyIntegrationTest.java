package com.timeright.tcc.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.FuncionarioServicoRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class FuncionarioServicosConcurrencyIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private FuncionarioServicoRepository funcionarioServicoRepository;

    @Test
    void duasSubstituicoesConcorrentesNaoProduzemConjuntoMisturado() throws Exception {
        Usuario manager = usuario("manager-concorrencia@teste.com");
        Salao salao = salao(manager);
        Funcionario funcionario = funcionario(salao);
        Servico primeiro = servico("Primeiro", salao);
        Servico segundo = servico("Segundo", salao);
        Servico terceiro = servico("Terceiro", salao);
        Servico quarto = servico("Quarto", salao);
        String authorization = "Bearer " + jwtService.emitirToken(manager);
        String conjuntoUm = "{\"servicoIds\":[" + primeiro.getId() + "," + segundo.getId() + "]}";
        String conjuntoDois = "{\"servicoIds\":[" + terceiro.getId() + "," + quarto.getId() + "]}";

        CountDownLatch inicio = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> primeiraResposta = executor.submit(() -> executarPut(
                    funcionario.getId(), authorization, conjuntoUm, inicio));
            Future<Integer> segundaResposta = executor.submit(() -> executarPut(
                    funcionario.getId(), authorization, conjuntoDois, inicio));
            inicio.countDown();

            assertEquals(200, primeiraResposta.get());
            assertEquals(200, segundaResposta.get());
        } finally {
            executor.shutdownNow();
        }

        Set<Long> finais = funcionarioServicoRepository
                .findByIdFuncionarioId(funcionario.getId()).stream()
                .map(item -> item.getId().getServicoId())
                .collect(java.util.stream.Collectors.toSet());
        assertTrue(finais.equals(Set.of(primeiro.getId(), segundo.getId()))
                || finais.equals(Set.of(terceiro.getId(), quarto.getId())));
    }

    private int executarPut(Long funcionarioId, String authorization, String body,
                            CountDownLatch inicio) throws Exception {
        inicio.await();
        return mockMvc.perform(put("/funcionarios/{id}/servicos", funcionarioId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn().getResponse().getStatus();
    }

    private Usuario usuario(String email) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome("MANAGER");
        nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);
        Usuario usuario = new Usuario();
        usuario.setNome("Gerente Concorrencia");
        usuario.setUsername(email);
        usuario.setPassword("hash");
        usuario.setStatusUsuario("ATIVO");
        usuario.setNivelAcesso(nivel);
        return usuarioRepository.save(usuario);
    }

    private Salao salao(Usuario manager) {
        Salao salao = new Salao();
        salao.setNome("Salao Concorrencia");
        salao.setCnpj("33333333000133");
        salao.setEmail("concorrencia@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setGerente(manager);
        return salaoRepository.save(salao);
    }

    private Funcionario funcionario(Salao salao) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Profissional Concorrencia");
        funcionario.setEmail("profissional-concorrencia@teste.com");
        funcionario.setSenha("hash");
        funcionario.setFuncao("Profissional");
        funcionario.setStatus("ATIVO");
        funcionario.setSalao(salao);
        return funcionarioRepository.save(funcionario);
    }

    private Servico servico(String nome, Salao salao) {
        Servico servico = new Servico();
        servico.setNome(nome);
        servico.setDescricao("Descricao");
        servico.setPreco(50.0);
        servico.setDuracao(30);
        servico.setStatus("ATIVO");
        servico.setSalao(salao);
        return servicoRepository.save(servico);
    }
}
