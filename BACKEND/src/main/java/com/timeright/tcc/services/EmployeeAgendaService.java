package com.timeright.tcc.services;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.EmployeeAgendamentoDTO;
import com.timeright.tcc.exception.ResourceNotFoundException;
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

    public EmployeeAgendaService(AuthenticatedUserService authenticatedUserService,
                                 UsuarioRepository usuarioRepository,
                                 FuncionarioRepository funcionarioRepository,
                                 AgendamentoRepository agendamentoRepository) {
        this.authenticatedUserService = authenticatedUserService;
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<EmployeeAgendamentoDTO> listarAgendaPropria() {
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
}
