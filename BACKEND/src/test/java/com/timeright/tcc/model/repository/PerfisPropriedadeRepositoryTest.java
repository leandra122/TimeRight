package com.timeright.tcc.model.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;

@DataJpaTest
@ActiveProfiles("test")
class PerfisPropriedadeRepositoryTest {

    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;

    @Test
    void gerentePodeSerRelacionadoAMaisDeUmSalaoEBuscadoPorId() {
        Usuario gerente = salvarUsuario("Gerente", "gerente@teste.com", "manager");
        Salao primeiro = salvarSalao("Salao Um", "11.111.111/0001-11", gerente);
        Salao segundo = salvarSalao("Salao Dois", "22.222.222/0001-22", gerente);

        List<Salao> saloes = salaoRepository.findByGerenteId(gerente.getId());

        assertEquals(2, saloes.size());
        assertTrue(saloes.stream().map(Salao::getId).toList()
                .containsAll(List.of(primeiro.getId(), segundo.getId())));
    }

    @Test
    void usuarioPodeSerRelacionadoAUmFuncionarioEBuscadoPorUsuarioId() {
        Usuario conta = salvarUsuario("Funcionaria", "funcionaria@teste.com", "employee");
        Salao salao = salvarSalao("Salao Teste", "33.333.333/0001-33", null);
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Funcionaria");
        funcionario.setEmail("funcionaria@teste.com");
        funcionario.setSenha("senha-codificada");
        funcionario.setFuncao("Cabeleireira");
        funcionario.setStatus("ATIVO");
        funcionario.setSalao(salao);
        funcionario.setUsuario(conta);
        funcionario = funcionarioRepository.saveAndFlush(funcionario);

        Funcionario encontrado = funcionarioRepository.findByUsuarioId(conta.getId()).orElseThrow();

        assertEquals(funcionario.getId(), encontrado.getId());
        assertEquals(conta.getId(), encontrado.getUsuario().getId());
    }

    private Usuario salvarUsuario(String nome, String email, String nivelNome) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(nivelNome);
        nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(email);
        usuario.setPassword("senha-codificada");
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario("ATIVO");
        return usuarioRepository.save(usuario);
    }

    private Salao salvarSalao(String nome, String cnpj, Usuario gerente) {
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(cnpj);
        salao.setEmail(nome.toLowerCase().replace(' ', '.') + "@teste.com");
        salao.setEndereco("Rua Teste, 123");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setGerente(gerente);
        return salaoRepository.save(salao);
    }
}
