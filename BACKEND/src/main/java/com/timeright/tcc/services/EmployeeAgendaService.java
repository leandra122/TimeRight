package com.timeright.tcc.services;

import java.util.List;
import java.time.Clock;
import java.time.LocalDateTime;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.EmployeeAgendamentoDTO;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.exception.ConflictException;
import com.timeright.tcc.model.entity.Agendamento;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class EmployeeAgendaService {

    private final AuthenticatedUserService authenticatedUserService;
    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final Clock clock;

    public EmployeeAgendaService(AuthenticatedUserService authenticatedUserService,
                                 UsuarioRepository usuarioRepository,
                                 FuncionarioRepository funcionarioRepository,
                                 AgendamentoRepository agendamentoRepository,
                                 Clock clock) {
        this.authenticatedUserService = authenticatedUserService;
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<EmployeeAgendamentoDTO> listarAgendaPropria() {
        Funcionario funcionario = funcionarioAutenticado();

        return agendamentoRepository
                .buscarAgendaEmployeeComVinculosConsistentes(funcionario.getId())
                .stream()
                .map(agendamento -> new EmployeeAgendamentoDTO(
                        agendamento.getId(),
                        agendamento.getDataHora(),
                        agendamento.getDuracao(),
                        agendamento.getStatus(),
                        agendamento.getObservacoes(),
                        agendamento.getUsuario().getId(),
                        agendamento.getUsuario().getNome(),
                        agendamento.getServico().getId(),
                        agendamento.getServico().getNome(),
                        funcionario.getSalao().getId(),
                        funcionario.getSalao().getNome()))
                .toList();
    }

    @Transactional
    public EmployeeAgendamentoDTO concluir(Long agendamentoId) {
        Funcionario funcionario = funcionarioAutenticado();
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
        if (agendamento.getFuncionario() == null
                || !funcionario.getId().equals(agendamento.getFuncionario().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        if (!"AGENDADO".equalsIgnoreCase(agendamento.getStatus())) {
            throw new ConflictException("Agendamento não pode ser concluído neste estado");
        }
        if (agendamento.getDataHora() != null && agendamento.getDataHora().isAfter(LocalDateTime.now(clock))) {
            throw new ConflictException("Atendimento futuro não pode ser concluído");
        }
        agendamento.setStatus("CONCLUIDO");
        Agendamento salvo = agendamentoRepository.save(agendamento);
        return new EmployeeAgendamentoDTO(
                salvo.getId(), salvo.getDataHora(), salvo.getDuracao(), salvo.getStatus(),
                salvo.getObservacoes(), salvo.getUsuario().getId(), salvo.getUsuario().getNome(),
                salvo.getServico().getId(), salvo.getServico().getNome(),
                funcionario.getSalao().getId(), funcionario.getSalao().getNome());
    }

    private Funcionario funcionarioAutenticado() {
        AuthenticatedUser autenticado = authenticatedUserService.getCurrentUser();
        if (!"EMPLOYEE".equals(autenticado.role())) {
            throw new AccessDeniedException("Acesso negado");
        }

        Usuario usuario = usuarioRepository.findById(autenticado.userId())
                .orElseThrow(() -> new AccessDeniedException("Acesso negado"));
        if (!"ATIVO".equalsIgnoreCase(usuario.getStatusUsuario())
                || usuario.getNivelAcesso() == null
                || !"EMPLOYEE".equalsIgnoreCase(usuario.getNivelAcesso().getNome())
                || !"ATIVO".equalsIgnoreCase(usuario.getNivelAcesso().getStatusNivelAcesso())) {
            throw new AccessDeniedException("Acesso negado");
        }

        Funcionario funcionario = funcionarioRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário vinculado não encontrado"));
        if (!"ATIVO".equalsIgnoreCase(funcionario.getStatus())) {
            throw new AccessDeniedException("Acesso negado");
        }

        return funcionario;
    }
}
