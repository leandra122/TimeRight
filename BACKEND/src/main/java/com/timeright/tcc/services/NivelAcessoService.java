package com.timeright.tcc.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.repository.NivelAcessoRepository;

@Service
public class NivelAcessoService {

    private final NivelAcessoRepository nivelAcessoRepository;

    public NivelAcessoService(NivelAcessoRepository nivelAcessoRepository) {
        this.nivelAcessoRepository = nivelAcessoRepository;
    }

    public List<NivelAcesso> listarTodos() {
        return nivelAcessoRepository.findAll();
    }

    // 🔥 CORREÇÃO AQUI (Integer → Long)
    public NivelAcesso findById(Long id) {
        return nivelAcessoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nível de acesso não encontrado com id " + id));
    }
}