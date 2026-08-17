package com.timeright.tcc.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.FuncionarioCatalogoResponse;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.SalaoRepository;

@Service
public class CatalogoFuncionarioService {

    private final SalaoRepository salaoRepository;
    private final FuncionarioRepository funcionarioRepository;

    public CatalogoFuncionarioService(SalaoRepository salaoRepository,
                                      FuncionarioRepository funcionarioRepository) {
        this.salaoRepository = salaoRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional(readOnly = true)
    public List<FuncionarioCatalogoResponse> listarAtivosPorSalao(Long salaoId) {
        Salao salao = salaoRepository.findById(salaoId)
                .filter(item -> "ATIVO".equalsIgnoreCase(item.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));

        return funcionarioRepository
                .findBySalaoIdAndStatusIgnoreCaseOrderByNomeAscIdAsc(salao.getId(), "ATIVO")
                .stream()
                .map(funcionario -> new FuncionarioCatalogoResponse(
                        funcionario.getId(), funcionario.getNome(),
                        funcionario.getFuncao(), salao.getId()))
                .toList();
    }
}
