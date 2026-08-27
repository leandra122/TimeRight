package com.timeright.tcc.services;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.FuncionarioServicosRequest;
import com.timeright.tcc.dto.FuncionarioServicosResponse;
import com.timeright.tcc.dto.FuncionarioServicosResponse.ServicoResumo;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.FuncionarioServico;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.FuncionarioServicoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class FuncionarioServicoService {

    private final FuncionarioRepository funcionarioRepository;
    private final ServicoRepository servicoRepository;
    private final FuncionarioServicoRepository funcionarioServicoRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public FuncionarioServicoService(FuncionarioRepository funcionarioRepository,
                                     ServicoRepository servicoRepository,
                                     FuncionarioServicoRepository funcionarioServicoRepository,
                                     AuthenticatedUserService authenticatedUserService) {
        this.funcionarioRepository = funcionarioRepository;
        this.servicoRepository = servicoRepository;
        this.funcionarioServicoRepository = funcionarioServicoRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Transactional(readOnly = true)
    public FuncionarioServicosResponse consultar(Long funcionarioId) {
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        autorizarConsulta(funcionario);
        List<Servico> servicos = funcionarioServicoRepository
                .findServicosByFuncionarioId(funcionarioId);
        return resposta(funcionario, servicos);
    }

    @Transactional
    public FuncionarioServicosResponse substituir(Long funcionarioId,
                                                   FuncionarioServicosRequest request) {
        AuthenticatedUser gerente = requireManager();
        Funcionario funcionario = funcionarioRepository.findByIdForUpdate(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
        if (!funcionarioRepository.existsByIdAndSalaoGerenteId(funcionarioId, gerente.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        if (!"ATIVO".equalsIgnoreCase(funcionario.getStatus())) {
            throw new IllegalArgumentException("Funcionário inativo não pode receber atribuições");
        }

        List<Servico> servicos = validarServicos(request, funcionario.getSalao().getId());

        funcionarioServicoRepository.deleteByIdFuncionarioId(funcionarioId);
        funcionarioServicoRepository.saveAllAndFlush(servicos.stream()
                .map(servico -> new FuncionarioServico(funcionario, servico))
                .toList());
        return resposta(funcionario, servicos);
    }

    private void autorizarConsulta(Funcionario funcionario) {
        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if ("ADMIN".equals(authenticated.role())) return;
        if (!"MANAGER".equals(authenticated.role())
                || !funcionarioRepository.existsByIdAndSalaoGerenteId(
                        funcionario.getId(), authenticated.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
    }

    private AuthenticatedUser requireManager() {
        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(authenticated.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return authenticated;
    }

    private List<Servico> validarServicos(FuncionarioServicosRequest request, Long salaoId) {
        if (request == null || request.servicoIds() == null) {
            throw new IllegalArgumentException("servicoIds é obrigatório");
        }
        LinkedHashSet<Long> ids = new LinkedHashSet<>();
        for (Long id : request.servicoIds()) {
            if (id == null) throw new IllegalArgumentException("ID de serviço não pode ser nulo");
            ids.add(id);
        }

        Map<Long, Servico> encontrados = new LinkedHashMap<>();
        servicoRepository.findAllById(ids).forEach(servico -> encontrados.put(servico.getId(), servico));
        return ids.stream().map(id -> {
            Servico servico = encontrados.get(id);
            if (servico == null) throw new ResourceNotFoundException("Serviço não encontrado: " + id);
            if (!"ATIVO".equalsIgnoreCase(servico.getStatus())) {
                throw new IllegalArgumentException("Serviço inativo: " + id);
            }
            if (servico.getSalao() == null || !salaoId.equals(servico.getSalao().getId())) {
                throw new IllegalArgumentException("Serviço pertence a outro salão: " + id);
            }
            return servico;
        }).toList();
    }

    private FuncionarioServicosResponse resposta(Funcionario funcionario, List<Servico> servicos) {
        List<ServicoResumo> itens = servicos.stream()
                .map(servico -> new ServicoResumo(servico.getId(), servico.getNome(),
                        servico.getPreco(), servico.getDuracao(), servico.getStatus()))
                .toList();
        return new FuncionarioServicosResponse(
                funcionario.getId(), funcionario.getSalao().getId(), itens);
    }
}
