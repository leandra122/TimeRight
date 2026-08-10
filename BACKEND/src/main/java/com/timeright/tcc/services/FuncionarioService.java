package com.timeright.tcc.services;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.SalaoRepository;

import jakarta.transaction.Transactional;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final SalaoRepository salaoRepository;
    private final PasswordEncoder passwordEncoder;

    public FuncionarioService(FuncionarioRepository funcionarioRepository,
                              SalaoRepository salaoRepository,
                              PasswordEncoder passwordEncoder) {
        this.funcionarioRepository = funcionarioRepository;
        this.salaoRepository = salaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // LISTAR
    public List<Funcionario> listar() {
        return funcionarioRepository.findAll();
    }

    // BUSCAR POR ID
    public Funcionario findById(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
    }

    // CADASTRAR (feito pelo dono do salão)
    @Transactional
    public Funcionario salvar(Funcionario funcionario, Long salaoId) {

        if (funcionarioRepository.findByEmail(funcionario.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Salao salao = salaoRepository.findById(salaoId)
                .orElseThrow(() -> new RuntimeException("Salão não encontrado"));

        Funcionario novo = new Funcionario();
        novo.setNome(funcionario.getNome());
        novo.setEmail(funcionario.getEmail());
        novo.setSenha(passwordEncoder.encode(funcionario.getSenha()));
        novo.setObservacoes(funcionario.getObservacoes());
        novo.setFuncao(funcionario.getFuncao());
        novo.setStatus("ATIVO");
        novo.setSalao(salao);

        return funcionarioRepository.save(novo);
    }

    // ATUALIZAR
    @Transactional
    public Funcionario atualizar(Long id, Funcionario funcionario) {

        Funcionario existente = findById(id);

        if (funcionario.getNome() != null)
            existente.setNome(funcionario.getNome());

        if (funcionario.getEmail() != null)
            existente.setEmail(funcionario.getEmail());

        if (funcionario.getSenha() != null)
            existente.setSenha(passwordEncoder.encode(funcionario.getSenha()));

        if (funcionario.getFuncao() != null)
            existente.setFuncao(funcionario.getFuncao());

        if (funcionario.getObservacoes() != null)
            existente.setObservacoes(funcionario.getObservacoes());

        return funcionarioRepository.save(existente);
    }

    // STATUS
    @Transactional
    public Funcionario atualizarStatus(Long id, String status) {
        Funcionario f = findById(id);
        f.setStatus(status);
        return funcionarioRepository.save(f);
    }

    // DELETE
    @Transactional
    public void deletar(Long id) {
        funcionarioRepository.delete(findById(id));
    }
}