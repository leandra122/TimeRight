package com.timeright.tcc.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.FuncionarioCatalogoResponse;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;

@Service
public class CatalogoFuncionarioService {

    private final SalaoRepository salaoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ServicoRepository servicoRepository;

    public CatalogoFuncionarioService(SalaoRepository salaoRepository,
                                      FuncionarioRepository funcionarioRepository,
                                      ServicoRepository servicoRepository) {
        this.salaoRepository = salaoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.servicoRepository = servicoRepository;
    }

    @Transactional(readOnly = true)
    public List<FuncionarioCatalogoResponse> listarAtivosPorSalao(Long salaoId, Long servicoId) {
        Salao salao = salaoRepository.findById(salaoId)
                .filter(item -> "ATIVO".equalsIgnoreCase(item.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));

        if (servicoId == null) throw new IllegalArgumentException("Serviço é obrigatório");
        Servico servico = servicoRepository.findById(servicoId)
                .filter(item -> "ATIVO".equalsIgnoreCase(item.getStatus())
                        && salao.getId().equals(item.getSalao().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        return funcionarioRepository
                .findAtivosHabilitadosPorServico(salao.getId(), servico.getId(), "ATIVO")
                .stream()
                .map(funcionario -> new FuncionarioCatalogoResponse(
                        funcionario.getId(), funcionario.getNome(),
                        funcionario.getFuncao(), salao.getId()))
                .toList();
    }
}
