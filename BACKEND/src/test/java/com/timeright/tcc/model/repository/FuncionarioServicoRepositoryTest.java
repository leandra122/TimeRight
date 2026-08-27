package com.timeright.tcc.model.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.FuncionarioServico;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;

import jakarta.persistence.EntityManager;

@DataJpaTest
@ActiveProfiles("test")
class FuncionarioServicoRepositoryTest {

    @Autowired private FuncionarioServicoRepository repository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void funcionarioPodeTerMultiplosServicosEConsultaPorFuncionario() {
        Salao salao = salao("Salao Um", "11111111000111");
        Funcionario funcionario = funcionario("Ana", "ana@teste.com", salao, "ATIVO");
        Servico corte = servico("Corte", salao, "ATIVO");
        Servico penteado = servico("Penteado", salao, "INATIVO");

        repository.saveAllAndFlush(List.of(
                new FuncionarioServico(funcionario, corte),
                new FuncionarioServico(funcionario, penteado)));

        assertEquals(2, repository.findByIdFuncionarioId(funcionario.getId()).size());
    }

    @Test
    void servicoPodeTerMultiplosFuncionariosEConsultaPorServico() {
        Salao salao = salao("Salao Dois", "22222222000122");
        Servico servico = servico("Manicure", salao, "ATIVO");
        Funcionario ana = funcionario("Ana", "ana2@teste.com", salao, "ATIVO");
        Funcionario bia = funcionario("Bia", "bia2@teste.com", salao, "INATIVO");

        repository.saveAllAndFlush(List.of(
                new FuncionarioServico(ana, servico),
                new FuncionarioServico(bia, servico)));

        assertEquals(2, repository.findByIdServicoId(servico.getId()).size());
        assertEquals(2, repository.findFuncionariosByServicoId(servico.getId()).size());
    }

    @Test
    void chavePrimariaImpedeAssociacaoDuplicada() {
        Salao salao = salao("Salao Tres", "33333333000133");
        Funcionario funcionario = funcionario("Caio", "caio@teste.com", salao, "ATIVO");
        Servico servico = servico("Barba", salao, "ATIVO");
        repository.saveAndFlush(new FuncionarioServico(funcionario, servico));

        assertThrows(DataIntegrityViolationException.class, () -> jdbcTemplate.update(
                "INSERT INTO FuncionarioServico (funcionario_id, servico_id, salao_id) VALUES (?, ?, ?)",
                funcionario.getId(), servico.getId(), salao.getId()));
    }

    @Test
    void fksCompostasRejeitamFuncionarioEServicoDeSaloesDiferentes() {
        Salao primeiro = salao("Salao Quatro", "44444444000144");
        Salao segundo = salao("Salao Cinco", "55555555000155");
        Funcionario funcionario = funcionario("Dani", "dani@teste.com", primeiro, "ATIVO");
        Servico servico = servico("Coloracao", segundo, "ATIVO");

        assertThrows(DataIntegrityViolationException.class,
                () -> repository.saveAndFlush(new FuncionarioServico(funcionario, servico)));
    }

    @Test
    void verificaExistenciaEExcluiSomenteAssociacoesDoFuncionario() {
        Salao salao = salao("Salao Seis", "66666666000166");
        Funcionario primeiro = funcionario("Eva", "eva@teste.com", salao, "ATIVO");
        Funcionario segundo = funcionario("Fabi", "fabi@teste.com", salao, "ATIVO");
        Servico servico = servico("Escova", salao, "ATIVO");
        repository.saveAllAndFlush(List.of(
                new FuncionarioServico(primeiro, servico),
                new FuncionarioServico(segundo, servico)));

        assertTrue(repository.existsByIdFuncionarioIdAndIdServicoId(
                primeiro.getId(), servico.getId()));
        assertEquals(1, repository.deleteByIdFuncionarioId(primeiro.getId()));
        repository.flush();
        assertFalse(repository.existsByIdFuncionarioIdAndIdServicoId(
                primeiro.getId(), servico.getId()));
        assertTrue(repository.existsByIdFuncionarioIdAndIdServicoId(
                segundo.getId(), servico.getId()));
    }

    @Test
    void excluiSomenteAssociacoesDoServico() {
        Salao salao = salao("Salao Sete", "77777777000177");
        Funcionario funcionario = funcionario("Gabi", "gabi@teste.com", salao, "ATIVO");
        Servico primeiro = servico("Luzes", salao, "ATIVO");
        Servico segundo = servico("Hidratacao", salao, "ATIVO");
        repository.saveAllAndFlush(List.of(
                new FuncionarioServico(funcionario, primeiro),
                new FuncionarioServico(funcionario, segundo)));

        assertEquals(1, repository.deleteByIdServicoId(primeiro.getId()));
        repository.flush();
        assertFalse(repository.existsByIdFuncionarioIdAndIdServicoId(
                funcionario.getId(), primeiro.getId()));
        assertTrue(repository.existsByIdFuncionarioIdAndIdServicoId(
                funcionario.getId(), segundo.getId()));
    }

    @Test
    void associacaoPermaneceValidaComFuncionarioEServicoInativos() {
        Salao salao = salao("Salao Oito", "88888888000188");
        Funcionario funcionario = funcionario("Helo", "helo@teste.com", salao, "INATIVO");
        Servico servico = servico("Massagem", salao, "INATIVO");

        repository.saveAndFlush(new FuncionarioServico(funcionario, servico));

        assertTrue(repository.existsByIdFuncionarioIdAndIdServicoId(
                funcionario.getId(), servico.getId()));
    }

    @Test
    void backfillRelacionaTodosDoMesmoSalaoSemFiltrarStatus() {
        Salao salao = salao("Salao Backfill", "10101010000110");
        funcionario("Jo", "jo@teste.com", salao, "ATIVO");
        funcionario("Ka", "ka@teste.com", salao, "INATIVO");
        servico("Ativo", salao, "ATIVO");
        servico("Inativo", salao, "INATIVO");

        int inseridos = jdbcTemplate.update("""
                INSERT INTO FuncionarioServico (funcionario_id, servico_id, salao_id)
                SELECT f.id, s.id, f.salao_id
                FROM Funcionario f
                INNER JOIN Servico s ON s.salao_id = f.salao_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM FuncionarioServico fs
                    WHERE fs.funcionario_id = f.id AND fs.servico_id = s.id
                )
                """);

        assertEquals(4, inseridos);
        assertEquals(4, repository.count());
    }

    @Test
    void entidadeNaoSerializaFuncionarioNemServicoCompletos() throws Exception {
        Salao salao = salao("Salao Nove", "99999999000199");
        Funcionario funcionario = funcionario("Iara", "iara@teste.com", salao, "ATIVO");
        Servico servico = servico("Unhas", salao, "ATIVO");
        FuncionarioServico associacao = repository.saveAndFlush(
                new FuncionarioServico(funcionario, servico));
        entityManager.clear();

        String json = new ObjectMapper().writeValueAsString(associacao);

        assertFalse(json.contains("\"funcionario\":"));
        assertFalse(json.contains("\"servico\":"));
        assertTrue(json.contains("salaoId"));
    }

    private Salao salao(String nome, String cnpj) {
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(cnpj);
        salao.setEmail(cnpj + "@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        return salaoRepository.save(salao);
    }

    private Funcionario funcionario(String nome, String email, Salao salao, String status) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha("hash");
        funcionario.setFuncao("Profissional");
        funcionario.setStatus(status);
        funcionario.setSalao(salao);
        return funcionarioRepository.saveAndFlush(funcionario);
    }

    private Servico servico(String nome, Salao salao, String status) {
        Servico servico = new Servico();
        servico.setNome(nome);
        servico.setDescricao("Descricao");
        servico.setPreco(50.0);
        servico.setDuracao(30);
        servico.setStatus(status);
        servico.setSalao(salao);
        return servicoRepository.saveAndFlush(servico);
    }
}
