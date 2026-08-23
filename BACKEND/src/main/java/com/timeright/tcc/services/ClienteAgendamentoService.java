package com.timeright.tcc.services;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.ClienteAgendamentoRequest;
import com.timeright.tcc.dto.ClienteAgendamentoResponse;
import com.timeright.tcc.dto.ClienteAgendamentoResponse.FuncionarioResumo;
import com.timeright.tcc.dto.ClienteAgendamentoResponse.SalaoResumo;
import com.timeright.tcc.dto.ClienteAgendamentoResponse.ServicoResumo;
import com.timeright.tcc.dto.ClienteDisponibilidadeResponse;
import com.timeright.tcc.exception.ConflictException;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Agendamento;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class ClienteAgendamentoService {

    private static final String AGENDADO = "AGENDADO";
    private static final String CANCELADO = "CANCELADO";

    private final AuthenticatedUserService authenticatedUserService;
    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ServicoRepository servicoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final DisponibilidadeAgendamentoService disponibilidadeService;
    private final Clock clock;

    public ClienteAgendamentoService(AuthenticatedUserService authenticatedUserService,
                                     UsuarioRepository usuarioRepository,
                                     FuncionarioRepository funcionarioRepository,
                                     ServicoRepository servicoRepository,
                                     AgendamentoRepository agendamentoRepository,
                                     DisponibilidadeAgendamentoService disponibilidadeService,
                                     Clock clock) {
        this.authenticatedUserService = authenticatedUserService;
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.servicoRepository = servicoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.disponibilidadeService = disponibilidadeService;
        this.clock = clock;
    }

    @Transactional
    public ClienteAgendamentoResponse criar(ClienteAgendamentoRequest request) {
        Usuario cliente = requireClienteAtivo();
        Funcionario funcionario = funcionarioRepository.findByIdForUpdate(request.funcionarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        Servico servico = servicoRepository.findById(request.servicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        validarRecursos(funcionario, servico);
        Integer duracao = servico.getDuracao();
        LocalDateTime dataHora =
                disponibilidadeService.validarParaCriacao(funcionario, servico, request.dataHora());

        Agendamento agendamento = new Agendamento();
        agendamento.setUsuario(cliente);
        agendamento.setFuncionario(funcionario);
        agendamento.setServico(servico);
        agendamento.setDataHora(dataHora);
        agendamento.setDuracao(duracao);
        agendamento.setStatus(AGENDADO);
        agendamento.setObservacoes(normalizarObservacoes(request.observacoes()));
        return toResponse(agendamentoRepository.save(agendamento));
    }

    @Transactional(readOnly = true)
    public ClienteDisponibilidadeResponse consultarDisponibilidade(
            Long funcionarioId, Long servicoId, LocalDate data) {
        requireClienteAtivo();
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        Servico servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        validarRecursos(funcionario, servico);
        return disponibilidadeService.consultar(funcionario, servico, data);
    }

    @Transactional(readOnly = true)
    public List<ClienteAgendamentoResponse> listarProprios() {
        Usuario cliente = requireClienteAtivo();
        return agendamentoRepository.buscarClienteComVinculosConsistentes(cliente.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ClienteAgendamentoResponse cancelar(Long agendamentoId) {
        Usuario cliente = requireClienteAtivo();
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
        if (agendamento.getUsuario() == null
                || !cliente.getId().equals(agendamento.getUsuario().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        if (!AGENDADO.equalsIgnoreCase(agendamento.getStatus())) {
            throw new ConflictException("Agendamento não pode ser cancelado neste estado");
        }
        LocalDateTime agora = agoraNormalizado();
        if (agendamento.getDataHora() == null
                || normalizarParaSegundos(agendamento.getDataHora()).isBefore(agora)) {
            throw new ConflictException("Agendamento passado não pode ser cancelado");
        }

        agendamento.setStatus(CANCELADO);
        return toResponse(agendamentoRepository.save(agendamento));
    }

    private Usuario requireClienteAtivo() {
        AuthenticatedUser autenticado = authenticatedUserService.getCurrentUser();
        if (!"USER".equals(autenticado.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        Usuario usuario = usuarioRepository.findById(autenticado.userId())
                .orElseThrow(() -> new AccessDeniedException("Acesso negado"));
        if (!"ATIVO".equalsIgnoreCase(usuario.getStatusUsuario())
                || usuario.getNivelAcesso() == null
                || !"USER".equalsIgnoreCase(usuario.getNivelAcesso().getNome())
                || !"ATIVO".equalsIgnoreCase(usuario.getNivelAcesso().getStatusNivelAcesso())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return usuario;
    }

    private void validarRecursos(Funcionario funcionario, Servico servico) {
        if (!"ATIVO".equalsIgnoreCase(funcionario.getStatus())) {
            throw new IllegalArgumentException("Funcionário indisponível");
        }
        if (!"ATIVO".equalsIgnoreCase(servico.getStatus())) {
            throw new IllegalArgumentException("Serviço indisponível");
        }
        Salao salao = funcionario.getSalao();
        if (salao == null || !"ATIVO".equalsIgnoreCase(salao.getStatus())) {
            throw new IllegalArgumentException("Salão indisponível");
        }
        if (servico.getSalao() == null || !salao.getId().equals(servico.getSalao().getId())) {
            throw new IllegalArgumentException(
                    "Funcionário e serviço devem pertencer ao mesmo salão");
        }
        if (servico.getDuracao() == null || servico.getDuracao() <= 0) {
            throw new IllegalArgumentException("Serviço possui duração inválida");
        }
    }

    private LocalDateTime agoraNormalizado() {
        return normalizarParaSegundos(LocalDateTime.now(clock));
    }

    private LocalDateTime normalizarParaSegundos(LocalDateTime dataHora) {
        return dataHora.truncatedTo(ChronoUnit.SECONDS);
    }

    private String normalizarObservacoes(String observacoes) {
        if (observacoes == null) return null;
        String normalizada = observacoes.trim();
        return normalizada.isEmpty() ? null : normalizada;
    }

    private ClienteAgendamentoResponse toResponse(Agendamento agendamento) {
        Funcionario funcionario = agendamento.getFuncionario();
        Servico servico = agendamento.getServico();
        Salao salao = funcionario.getSalao();
        return new ClienteAgendamentoResponse(
                agendamento.getId(), agendamento.getDataHora(), agendamento.getDuracao(),
                agendamento.getStatus(), agendamento.getObservacoes(),
                new SalaoResumo(salao.getId(), salao.getNome()),
                new ServicoResumo(servico.getId(), servico.getNome(), servico.getPreco()),
                new FuncionarioResumo(funcionario.getId(), funcionario.getNome(), funcionario.getFuncao()));
    }
}
