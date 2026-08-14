package com.timeright.tcc.services;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.SalaoServicosDTO;
import com.timeright.tcc.dto.ServicoDTO;
import com.timeright.tcc.dto.ConfiguracaoAgendamentoSalaoRequest;
import com.timeright.tcc.dto.ConfiguracaoAgendamentoSalaoResponse;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.integration.CnpjConsultaGateway;
import com.timeright.tcc.integration.CnpjConsultaResultado;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;
import com.timeright.tcc.util.CnpjValidator;

@Service
public class SalaoService {

    private static final int ANTECEDENCIA_PADRAO_MINUTOS = 120;
    private static final int LIMITE_PADRAO_DIAS = 60;
    private static final String FUSO_HORARIO_MVP = "America/Sao_Paulo";

    private final SalaoRepository salaoRepository;
    private final ServicoRepository servicoRepository;
    private final CnpjConsultaGateway cnpjGateway;
    private final UsuarioRepository usuarioRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public SalaoService(SalaoRepository salaoRepository,
                        ServicoRepository servicoRepository,
                        CnpjConsultaGateway cnpjGateway,
                        UsuarioRepository usuarioRepository,
                        AuthenticatedUserService authenticatedUserService) {
        this.salaoRepository = salaoRepository;
        this.servicoRepository = servicoRepository;
        this.cnpjGateway = cnpjGateway;
        this.usuarioRepository = usuarioRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    // =========================
    // CREATE COM SERVIÇOS
    // =========================
    @Transactional
    public Salao salvarComServicos(SalaoServicosDTO dto) {

        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(authenticated.role())) {
            throw new AccessDeniedException("Acesso negado");
        }

        var gerente = usuarioRepository.findById(authenticated.userId())
                .orElseThrow(() -> new AccessDeniedException("Acesso negado"));
        String managerRole = gerente.getNivelAcesso() == null
                ? "" : gerente.getNivelAcesso().getNome().trim().toUpperCase();
        if ("ADM".equals(managerRole)) managerRole = "ADMIN";
        if (!"ATIVO".equalsIgnoreCase(gerente.getStatusUsuario())
                || !"MANAGER".equals(managerRole)) {
            throw new AccessDeniedException("Acesso negado");
        }

        if (!CnpjValidator.isValid(dto.cnpj))
            throw new IllegalArgumentException("CNPJ inválido.");

        CnpjConsultaResultado consulta = cnpjGateway.consultar(dto.cnpj);

        Salao salao = new Salao();
        salao.setNome(dto.nome);
        salao.setCnpj(consulta.getCnpj());
        salao.setEmail(dto.email);
        salao.setTelefone(dto.telefone);
        salao.setEndereco(dto.endereco);
        salao.setStatus(dto.status != null ? dto.status : "ATIVO");
        salao.setGerente(gerente);

        Salao salaoSalvo = salaoRepository.save(salao);

        if (dto.servicos != null) {
            for (ServicoDTO s : dto.servicos) {

                Servico servico = new Servico();
                servico.setNome(s.nome);
                servico.setDescricao(s.descricao);
                servico.setPreco(s.preco);
                servico.setDuracao(s.duracao);
                servico.setStatus("ATIVO");
                servico.setSalao(salaoSalvo);

                servicoRepository.save(servico);
            }
        }

        return salaoSalvo;
    }

    // =========================
    // LISTAR
    // =========================
    public List<Salao> listarTodos() {
        return salaoRepository.findAll();
    }

    public List<Salao> listarMeusSaloes() {
        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(authenticated.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return salaoRepository.findByGerenteId(authenticated.userId());
    }

    // =========================
    // BUSCAR POR ID
    // =========================
    public Salao buscarPorId(Long id) {
        return salaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));
    }

    // =========================
    // DELETAR
    // =========================
    public void deletar(Long id) {
        buscarAutorizado(id);
        salaoRepository.deleteById(id);
    }

    public Salao atualizar(Long id, Salao dados) {
        Salao existente = buscarAutorizado(id);
        if (dados.getNome() != null) existente.setNome(dados.getNome());
        if (dados.getTelefone() != null) existente.setTelefone(dados.getTelefone());
        if (dados.getEmail() != null) existente.setEmail(dados.getEmail());
        if (dados.getEndereco() != null) existente.setEndereco(dados.getEndereco());
        if (dados.getStatus() != null) existente.setStatus(dados.getStatus());
        return salaoRepository.save(existente);
    }

    public Salao buscarAutorizado(Long id) {
        Salao salao = buscarPorId(id);
        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if ("ADMIN".equals(authenticated.role())) {
            return salao;
        }
        if (!"MANAGER".equals(authenticated.role())
                || !salaoRepository.existsByIdAndGerenteId(id, authenticated.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return salao;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoAgendamentoSalaoResponse buscarConfiguracaoAgendamento(Long id) {
        return respostaConfiguracao(buscarAutorizado(id));
    }

    @Transactional
    public ConfiguracaoAgendamentoSalaoResponse atualizarConfiguracaoAgendamento(
            Long id, ConfiguracaoAgendamentoSalaoRequest dados) {
        Salao salao = buscarAutorizado(id);
        validarConfiguracao(dados);
        salao.setAntecedenciaMinimaMinutos(dados.antecedenciaMinimaMinutos());
        salao.setLimiteAgendamentoDias(dados.limiteAgendamentoDias());
        return respostaConfiguracao(salaoRepository.save(salao));
    }

    private ConfiguracaoAgendamentoSalaoResponse respostaConfiguracao(Salao salao) {
        Integer antecedencia = salao.getAntecedenciaMinimaMinutos() == null
                ? ANTECEDENCIA_PADRAO_MINUTOS : salao.getAntecedenciaMinimaMinutos();
        Integer limite = salao.getLimiteAgendamentoDias() == null
                ? LIMITE_PADRAO_DIAS : salao.getLimiteAgendamentoDias();
        return new ConfiguracaoAgendamentoSalaoResponse(
                salao.getId(), antecedencia, limite, FUSO_HORARIO_MVP);
    }

    private void validarConfiguracao(ConfiguracaoAgendamentoSalaoRequest dados) {
        if (dados == null || dados.antecedenciaMinimaMinutos() == null
                || dados.antecedenciaMinimaMinutos() < 0
                || dados.antecedenciaMinimaMinutos() > 10080) {
            throw new IllegalArgumentException(
                    "Antecedência mínima deve estar entre 0 e 10080 minutos");
        }
        if (dados.limiteAgendamentoDias() == null
                || dados.limiteAgendamentoDias() < 1
                || dados.limiteAgendamentoDias() > 365) {
            throw new IllegalArgumentException(
                    "Limite de agendamento deve estar entre 1 e 365 dias");
        }
    }
}
