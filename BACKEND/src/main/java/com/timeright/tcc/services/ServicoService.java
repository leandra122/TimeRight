package com.timeright.tcc.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;

@Service
@SuppressWarnings("null")
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final SalaoRepository salaoRepository;

    public ServicoService(ServicoRepository servicoRepository, SalaoRepository salaoRepository) {
        this.servicoRepository = servicoRepository;
        this.salaoRepository = salaoRepository;
    }

    public List<Servico> listarTodos() {
        return servicoRepository.findAll();
    }

    public List<Servico> listarPorSalao(Long salaoId) {
        return servicoRepository.findBySalaoId(salaoId);
    }

    public Servico findById(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado com id " + id));
    }

    @Transactional
    public Servico salvar(Servico servico) {
        Salao salao = salaoRepository.findById(servico.getSalao().getId())
                .orElseThrow(() -> new RuntimeException("Salão não encontrado"));

        Servico novo = new Servico();
        novo.setNome(servico.getNome());
        novo.setDescricao(servico.getDescricao());
        novo.setPreco(servico.getPreco());
        novo.setDuracao(servico.getDuracao());
        novo.setStatus("ATIVO");
        novo.setSalao(salao);

        return servicoRepository.save(novo);
    }

    @Transactional
    public Servico atualizar(Long id, Servico servico) {
        Servico existente = findById(id);

        if (servico.getNome() != null && !servico.getNome().isBlank())
            existente.setNome(servico.getNome());
        if (servico.getDescricao() != null && !servico.getDescricao().isBlank())
            existente.setDescricao(servico.getDescricao());
        if (servico.getPreco() != null)
            existente.setPreco(servico.getPreco());
        if (servico.getDuracao() != null)
            existente.setDuracao(servico.getDuracao());
        if (servico.getSalao() != null && servico.getSalao().getId() != null) {
            Salao salao = salaoRepository.findById(servico.getSalao().getId())
                    .orElseThrow(() -> new RuntimeException("Salão não encontrado"));
            existente.setSalao(salao);
        }

        return servicoRepository.save(existente);
    }

    @Transactional
    public Servico atualizarStatus(Long id, String novoStatus) {
        Servico existente = findById(id);
        existente.setStatus(novoStatus);
        return servicoRepository.save(existente);
    }

    @Transactional
    public void deletar(Long id) {
        servicoRepository.delete(findById(id));
    }
}
