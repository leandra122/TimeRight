package com.timeright.tcc.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import com.timeright.tcc.exception.ResourceNotFoundException;

import com.timeright.tcc.model.entity.Agendamento;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ServicoRepository servicoRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public AgendamentoService(
            AgendamentoRepository agendamentoRepository,
            UsuarioRepository usuarioRepository,
            FuncionarioRepository funcionarioRepository,
            ServicoRepository servicoRepository,
            AuthenticatedUserService authenticatedUserService) {

        this.agendamentoRepository = agendamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.servicoRepository = servicoRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    public List<Agendamento> listarGlobal() {
        exigirPapel("ADMIN");
        return agendamentoRepository.findAll();
    }

    public List<Agendamento> listarMeus() {
        AuthenticatedUser user = exigirPapel("MANAGER");
        return agendamentoRepository.buscarPorGerenteComVinculosConsistentes(user.userId());
    }

    public List<Agendamento> listarPorUsuario(Long usuarioId) {
        exigirPapel("ADMIN");
        return agendamentoRepository.findByUsuarioId(usuarioId);
    }

    public Agendamento buscarAutorizado(Long id) {
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if ("ADMIN".equals(user.role())) {
            return buscarExistente(id);
        }
        if (!"MANAGER".equals(user.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        if (!agendamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Agendamento não encontrado");
        }
        return agendamentoRepository.buscarPorIdEGerenteComVinculosConsistentes(id, user.userId())
                .orElseThrow(() -> new AccessDeniedException("Acesso negado"));
    }

    private Agendamento buscarExistente(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
    }

    private AuthenticatedUser exigirPapel(String papel) {
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if (!papel.equals(user.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return user;
    }
    @Transactional
    public Agendamento salvar(Agendamento agendamento) {

        Usuario usuario = usuarioRepository.findById(agendamento.getUsuario().getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Bloqueia usuários INATIVOS
        if (!"ATIVO".equals(usuario.getStatusUsuario())) {
            throw new RuntimeException("Usuário inativo não pode realizar agendamentos.");
        }

        // Bloqueia usuários com 5 ou mais cancelamentos
        long cancelamentos = agendamentoRepository.countByUsuarioIdAndStatus(
                usuario.getId(), "CANCELADO");
        if (cancelamentos >= 5) {
            throw new RuntimeException(
                    "Usuário bloqueado: limite de 5 cancelamentos atingido.");
        }

        Funcionario funcionario = funcionarioRepository.findById(agendamento.getFuncionario().getId())
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        Servico servico = servicoRepository.findById(agendamento.getServico().getId())
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));

        LocalDateTime inicio = agendamento.getDataHora();

        // Não permite agendar no passado
        if (inicio.toLocalDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException(
                    "Não é possível agendar para uma data no passado.");
        }

        // Antecedência mínima de 12 horas
        if (inicio.isBefore(LocalDateTime.now().plusHours(12))) {
            throw new RuntimeException(
                    "O agendamento deve ser feito com no mínimo 12 horas de antecedência.");
        }

        LocalDateTime fim = inicio.plusMinutes(servico.getDuracao());

        if (agendamentoRepository.existeConflitoIntervalo(
                funcionario.getId(), inicio, fim, null)) {
            throw new RuntimeException("Horário indisponível para esse funcionário.");
        }

        Agendamento novo = new Agendamento();
        novo.setUsuario(usuario);
        novo.setFuncionario(funcionario);
        novo.setServico(servico);
        novo.setDataHora(inicio);
        novo.setDuracao(servico.getDuracao());
        novo.setStatus("AGENDADO");

        return agendamentoRepository.save(novo);
    }

    @Transactional
    public Agendamento atualizar(Long id, Agendamento agendamento) {

        Agendamento existente = buscarExistente(id);

        if (agendamento.getDataHora() != null) {

            LocalDateTime inicio = agendamento.getDataHora();

            // Não permite remarcar para data no passado
            if (inicio.toLocalDate().isBefore(java.time.LocalDate.now())) {
                throw new RuntimeException(
                        "Não é possível remarcar para uma data no passado.");
            }

            // Antecedência mínima de 12 horas para remarcação
            if (inicio.isBefore(LocalDateTime.now().plusHours(12))) {
                throw new RuntimeException(
                        "A remarcação deve ser feita com no mínimo 12 horas de antecedência.");
            }

            LocalDateTime fim = inicio.plusMinutes(existente.getDuracao());

            if (agendamentoRepository.existeConflitoIntervalo(
                    existente.getFuncionario().getId(), inicio, fim, id)) {
                throw new RuntimeException("Horário já ocupado.");
            }

            existente.setDataHora(inicio);
        }

        if (agendamento.getObservacoes() != null)
            existente.setObservacoes(agendamento.getObservacoes());

        if (agendamento.getFuncionario() != null) {
            Funcionario f = funcionarioRepository.findById(
                    agendamento.getFuncionario().getId())
                    .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
            existente.setFuncionario(f);
        }

        if (agendamento.getServico() != null) {
            Servico s = servicoRepository.findById(
                    agendamento.getServico().getId())
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));

            existente.setServico(s);
            existente.setDuracao(s.getDuracao());
        }

        return agendamentoRepository.save(existente);
    }

    @Transactional
    public Agendamento cancelar(Long id) {
        Agendamento a = buscarExistente(id);

        // Cancelamento somente com no mínimo 12 horas de antecedência
        if (a.getDataHora().isBefore(LocalDateTime.now().plusHours(12))) {
            throw new RuntimeException(
                    "Cancelamento somente permitido com no mínimo 12 horas de antecedência.");
        }

        a.setStatus("CANCELADO");
        return agendamentoRepository.save(a);
    }

    @Transactional
    public Agendamento atualizarStatus(Long id, String status) {
        Agendamento a = buscarExistente(id);
        a.setStatus(status);
        return agendamentoRepository.save(a);
    }

    @Transactional
    public void deletar(Long id) {
        agendamentoRepository.delete(buscarExistente(id));
    }
}
