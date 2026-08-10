package com.timeright.tcc.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.timeright.tcc.dto.SalaoServicosDTO;
import com.timeright.tcc.dto.ServicoDTO;
import com.timeright.tcc.integration.CnpjConsultaGateway;
import com.timeright.tcc.integration.CnpjConsultaResultado;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.util.CnpjValidator;

@Service
public class SalaoService {

    private final SalaoRepository salaoRepository;
    private final ServicoRepository servicoRepository;
    private final CnpjConsultaGateway cnpjGateway;

    public SalaoService(SalaoRepository salaoRepository,
                        ServicoRepository servicoRepository,
                        CnpjConsultaGateway cnpjGateway) {
        this.salaoRepository = salaoRepository;
        this.servicoRepository = servicoRepository;
        this.cnpjGateway = cnpjGateway;
    }

    // =========================
    // CREATE COM SERVIÇOS
    // =========================
    public Salao salvarComServicos(SalaoServicosDTO dto) {

        if (!CnpjValidator.isValid(dto.cnpj))
            throw new RuntimeException("CNPJ inválido.");

        CnpjConsultaResultado consulta = cnpjGateway.consultar(dto.cnpj);

        Salao salao = new Salao();
        salao.setNome(dto.nome);
        salao.setCnpj(consulta.getCnpj());
        salao.setEmail(dto.email);
        salao.setTelefone(dto.telefone);
        salao.setEndereco(dto.endereco);
        salao.setStatus(dto.status != null ? dto.status : "ATIVO");

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

    // =========================
    // BUSCAR POR ID
    // =========================
    public Salao buscarPorId(Long id) {
        return salaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salão não encontrado"));
    }

    // =========================
    // DELETAR
    // =========================
    public void deletar(Long id) {
        if (!salaoRepository.existsById(id)) {
            throw new RuntimeException("Salão não encontrado");
        }
        salaoRepository.deleteById(id);
    }

    public Salao atualizar(Long id, Salao dados) {
        Salao existente = buscarPorId(id);
        if (dados.getNome() != null) existente.setNome(dados.getNome());
        if (dados.getTelefone() != null) existente.setTelefone(dados.getTelefone());
        if (dados.getEmail() != null) existente.setEmail(dados.getEmail());
        if (dados.getEndereco() != null) existente.setEndereco(dados.getEndereco());
        if (dados.getStatus() != null) existente.setStatus(dados.getStatus());
        return salaoRepository.save(existente);
    }
}