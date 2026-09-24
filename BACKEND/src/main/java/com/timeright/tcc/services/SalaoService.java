package com.timeright.tcc.services;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.SalaoServicosDTO;
import com.timeright.tcc.dto.ServicoDTO;
import com.timeright.tcc.dto.ConfiguracaoAgendamentoSalaoRequest;
import com.timeright.tcc.dto.ConfiguracaoAgendamentoSalaoResponse;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.exception.ConflictException;
import org.springframework.dao.DataIntegrityViolationException;
import java.sql.SQLException;
import com.timeright.tcc.integration.CnpjConsultaGateway;
import com.timeright.tcc.integration.CnpjConsultaResultado;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;
import com.timeright.tcc.util.CnpjValidator;

@Service
public class SalaoService {

    private static final int ANTECEDENCIA_PADRAO_MINUTOS = 120;
    private static final int LIMITE_PADRAO_DIAS = 60;
    private static final String FUSO_HORARIO_MVP = "America/Sao_Paulo";

    private final SalaoRepository salaoRepository;
    private final ServicoRepository servicoRepository;
    private final CnpjConsultaGateway cnpjGateway;
    private final UsuarioRepository usuarioRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public SalaoService(SalaoRepository salaoRepository,
                        ServicoRepository servicoRepository,
                        CnpjConsultaGateway cnpjGateway,
                        UsuarioRepository usuarioRepository,
                        AuthenticatedUserService authenticatedUserService) {
        this.salaoRepository = salaoRepository;
        this.servicoRepository = servicoRepository;
        this.cnpjGateway = cnpjGateway;
        this.usuarioRepository = usuarioRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    // =========================
    // CREATE COM SERVIÇOS
    // =========================
    @Transactional
    public Salao salvarComServicos(SalaoServicosDTO dto) {

        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(authenticated.role())) {
            throw new AccessDeniedException("Acesso negado");
        }

        var gerente = usuarioRepository.findById(authenticated.userId())
                .orElseThrow(() -> new AccessDeniedException("Acesso negado"));
        String managerRole = gerente.getNivelAcesso() == null
                ? "" : gerente.getNivelAcesso().getNome().trim().toUpperCase();
        if ("ADM".equals(managerRole)) managerRole = "ADMIN";
        if (!"ATIVO".equalsIgnoreCase(gerente.getStatusUsuario())
                || !"MANAGER".equals(managerRole)) {
            throw new AccessDeniedException("Acesso negado");
        }

        if (!CnpjValidator.isValid(dto.cnpj))
            throw new IllegalArgumentException("CNPJ inválido.");

        String cnpj = dto.cnpj.replaceAll("[^0-9]", "");
        verificarDuplicidade(cnpj);
        validarCadastro(dto);
        CnpjConsultaResultado consulta = cnpjGateway.consultar(cnpj);

        Salao salao = new Salao();
        salao.setNome(dto.nome);
        salao.setCnpj(cnpj);
        salao.setEmail(dto.email);
        salao.setTelefone(dto.telefone);
        salao.setStatus(dto.status != null ? dto.status : "ATIVO");
        salao.setGerente(gerente);
        preencherDadosCadastrais(salao, dto);

        // A situação externa vem apenas do gateway, nunca do formulário.
        salao.setSituacaoCadastral(consulta.getSituacaoCadastral());
        Salao salaoSalvo;
        try {
            salaoSalvo = salaoRepository.saveAndFlush(salao);
        } catch (DataIntegrityViolationException exception) {
            // O INSERT de Salao tem apenas CNPJ como chave única de negócio.
            for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
                if (cause instanceof SQLException sql
                        && ("23505".equals(sql.getSQLState())
                            || sql.getErrorCode() == 2601 || sql.getErrorCode() == 2627)) {
                    throw new ConflictException("Este CNPJ já está cadastrado no TimeRight.");
                }
            }
            throw exception;
        }

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

    public CnpjConsultaResultado consultarCnpj(String cnpj) {
        CnpjConsultaResultado resultado = cnpjGateway.consultar(cnpj);
        verificarDuplicidade(resultado.getCnpj());
        return resultado;
    }

    private void verificarDuplicidade(String cnpj) {
        String mascara = cnpj.substring(0, 2) + "." + cnpj.substring(2, 5) + "."
                + cnpj.substring(5, 8) + "/" + cnpj.substring(8, 12) + "-" + cnpj.substring(12);
        if (salaoRepository.existsByCnpj(cnpj) || salaoRepository.existsByCnpj(mascara)) {
            throw new ConflictException("Este CNPJ já está cadastrado no TimeRight.");
        }
    }

    private void validarCadastro(SalaoServicosDTO dto) {
        obrigatorio(dto.nome, 100, "Nome");
        obrigatorio(dto.email, 100, "E-mail");
        obrigatorio(dto.telefone, 20, "Telefone");
        validarTamanho(dto.razaoSocial, 150, "Razão social");
        validarTamanho(dto.nomeFantasia, 150, "Nome fantasia");
        if (dto.status != null && !"ATIVO".equals(dto.status)) {
            throw new IllegalArgumentException("O salão deve ser cadastrado como ATIVO.");
        }
        if (dto.servicos != null) for (ServicoDTO servico : dto.servicos) {
            if (servico == null) throw new IllegalArgumentException("Serviço inválido.");
            obrigatorio(servico.nome, 100, "Nome do serviço");
            validarTamanho(servico.descricao, 255, "Descrição do serviço");
            if (servico.preco == null || !Double.isFinite(servico.preco) || servico.preco < 0
                    || servico.duracao == null || servico.duracao <= 0) {
                throw new IllegalArgumentException("Informe preço não negativo e duração positiva para o serviço.");
            }
        }
    }

    private void obrigatorio(String valor, int limite, String campo) {
        if (limpar(valor) == null) throw new IllegalArgumentException(campo + " é obrigatório.");
        validarTamanho(valor, limite, campo);
    }

    private void preencherDadosCadastrais(Salao salao, SalaoServicosDTO dto) {
        salao.setRazaoSocial(limpar(dto.razaoSocial));
        salao.setNomeFantasia(limpar(dto.nomeFantasia));
        salao.setSituacaoCadastral(limpar(dto.situacaoCadastral));
        salao.setCep(limpar(dto.cep));
        salao.setLogradouro(limpar(dto.logradouro));
        salao.setNumero(limpar(dto.numero));
        salao.setComplemento(limpar(dto.complemento));
        salao.setBairro(limpar(dto.bairro));
        salao.setCidade(limpar(dto.cidade));
        salao.setUf(limpar(dto.uf));
        salao.setPontoReferencia(limpar(dto.pontoReferencia));
        salao.setEndereco(salao.getLogradouro() == null ? limpar(dto.endereco) : comporEndereco(salao));
        validarEndereco(salao);
    }

    private String limpar(String valor) {
        if (valor == null) return null;
        String normalizado = valor.trim();
        return normalizado.isEmpty() ? null : normalizado;
    }

    private String comporEndereco(Salao salao) {
        StringBuilder endereco = new StringBuilder();
        adicionarParte(endereco, salao.getLogradouro());
        adicionarParte(endereco, salao.getNumero());
        adicionarParte(endereco, salao.getComplemento());
        adicionarParte(endereco, salao.getBairro());
        adicionarParte(endereco, salao.getCidade());
        adicionarParte(endereco, salao.getUf());
        if (salao.getPontoReferencia() != null) {
            adicionarParte(endereco, "Referência: " + salao.getPontoReferencia());
        }
        return endereco.toString();
    }

    private void validarEndereco(Salao salao) {
        if (limpar(salao.getEndereco()) == null) throw new IllegalArgumentException("Endereço é obrigatório");
        validarTamanho(salao.getEndereco(), 200, "Endereço completo");
        validarTamanho(salao.getLogradouro(), 150, "Logradouro");
        validarTamanho(salao.getNumero(), 20, "Número");
        validarTamanho(salao.getComplemento(), 100, "Complemento");
        validarTamanho(salao.getPontoReferencia(), 150, "Ponto de referência");
        validarTamanho(salao.getCep(), 9, "CEP");
        validarTamanho(salao.getBairro(), 100, "Bairro");
        validarTamanho(salao.getCidade(), 100, "Cidade");
        validarTamanho(salao.getUf(), 2, "UF");
    }

    private void validarTamanho(String valor, int limite, String campo) {
        if (valor != null && valor.length() > limite) {
            throw new IllegalArgumentException(campo + " deve ter no máximo " + limite + " caracteres");
        }
    }

    private void adicionarParte(StringBuilder endereco, String valor) {
        if (valor == null || valor.isBlank()) return;
        if (endereco.length() > 0) endereco.append(", ");
        endereco.append(valor.trim());
    }

    // =========================
    // LISTAR
    // =========================
    public List<Salao> listarTodos() {
        return salaoRepository.findAll();
    }

    public List<Salao> listarMeusSaloes() {
        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(authenticated.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return salaoRepository.findByGerenteId(authenticated.userId());
    }

    // =========================
    // BUSCAR POR ID
    // =========================
    public Salao buscarPorId(Long id) {
        return salaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));
    }

    // =========================
    // DELETAR
    // =========================
    public void deletar(Long id) {
        buscarAutorizado(id);
        salaoRepository.deleteById(id);
    }

    @Transactional
    public Salao atualizar(Long id, Salao dados) {
        Salao existente = buscarAutorizado(id);
        if (dados.getNome() != null) existente.setNome(dados.getNome());
        if (dados.getTelefone() != null) existente.setTelefone(dados.getTelefone());
        if (dados.getEmail() != null) existente.setEmail(dados.getEmail());
        if (dados.getStatus() != null) existente.setStatus(dados.getStatus());
        if (dados.getRazaoSocial() != null) existente.setRazaoSocial(dados.getRazaoSocial());
        if (dados.getNomeFantasia() != null) existente.setNomeFantasia(dados.getNomeFantasia());
        if (dados.getSituacaoCadastral() != null) existente.setSituacaoCadastral(dados.getSituacaoCadastral());
        boolean enderecoAlterado = dados.getEndereco() != null || dados.getCep() != null
                || dados.getLogradouro() != null || dados.getNumero() != null
                || dados.getComplemento() != null || dados.getBairro() != null
                || dados.getCidade() != null || dados.getUf() != null || dados.getPontoReferencia() != null;
        if (enderecoAlterado) {
            if (dados.getCep() != null) existente.setCep(limpar(dados.getCep()));
            if (dados.getLogradouro() != null) existente.setLogradouro(limpar(dados.getLogradouro()));
            if (dados.getNumero() != null) existente.setNumero(limpar(dados.getNumero()));
            if (dados.getComplemento() != null) existente.setComplemento(limpar(dados.getComplemento()));
            if (dados.getBairro() != null) existente.setBairro(limpar(dados.getBairro()));
            if (dados.getCidade() != null) existente.setCidade(limpar(dados.getCidade()));
            if (dados.getUf() != null) existente.setUf(limpar(dados.getUf()));
            if (dados.getPontoReferencia() != null) existente.setPontoReferencia(limpar(dados.getPontoReferencia()));
            if (existente.getLogradouro() != null) {
                String completo = comporEndereco(existente);
                if (dados.getLogradouro() == null && dados.getEndereco() != null
                        && !completo.equals(limpar(dados.getEndereco()))) {
                    throw new IllegalArgumentException("Edite o logradouro e os campos do endereço separadamente");
                }
                existente.setEndereco(completo);
            } else {
                // Endereços legados livres são preservados; a conversão deve ser explícita.
                if (dados.getLogradouro() != null || dados.getNumero() != null
                        || dados.getComplemento() != null || dados.getBairro() != null
                        || dados.getCidade() != null || dados.getUf() != null || dados.getPontoReferencia() != null) {
                    throw new IllegalArgumentException("Informe o logradouro para atualizar o endereço estruturado");
                }
                if (dados.getEndereco() != null) existente.setEndereco(limpar(dados.getEndereco()));
            }
            validarEndereco(existente);
        }
        return salaoRepository.save(existente);
    }

    public Salao buscarAutorizado(Long id) {
        Salao salao = buscarPorId(id);
        AuthenticatedUser authenticated = authenticatedUserService.getCurrentUser();
        if ("ADMIN".equals(authenticated.role())) {
            return salao;
        }
        if (!"MANAGER".equals(authenticated.role())
                || !salaoRepository.existsByIdAndGerenteId(id, authenticated.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return salao;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoAgendamentoSalaoResponse buscarConfiguracaoAgendamento(Long id) {
        return respostaConfiguracao(buscarAutorizado(id));
    }

    @Transactional
    public ConfiguracaoAgendamentoSalaoResponse atualizarConfiguracaoAgendamento(
            Long id, ConfiguracaoAgendamentoSalaoRequest dados) {
        Salao salao = buscarAutorizado(id);
        validarConfiguracao(dados);
        salao.setAntecedenciaMinimaMinutos(dados.antecedenciaMinimaMinutos());
        salao.setLimiteAgendamentoDias(dados.limiteAgendamentoDias());
        return respostaConfiguracao(salaoRepository.save(salao));
    }

    private ConfiguracaoAgendamentoSalaoResponse respostaConfiguracao(Salao salao) {
        Integer antecedencia = salao.getAntecedenciaMinimaMinutos() == null
                ? ANTECEDENCIA_PADRAO_MINUTOS : salao.getAntecedenciaMinimaMinutos();
        Integer limite = salao.getLimiteAgendamentoDias() == null
                ? LIMITE_PADRAO_DIAS : salao.getLimiteAgendamentoDias();
        return new ConfiguracaoAgendamentoSalaoResponse(
                salao.getId(), antecedencia, limite, FUSO_HORARIO_MVP);
    }

    private void validarConfiguracao(ConfiguracaoAgendamentoSalaoRequest dados) {
        if (dados == null || dados.antecedenciaMinimaMinutos() == null
                || dados.antecedenciaMinimaMinutos() < 0
                || dados.antecedenciaMinimaMinutos() > 10080) {
            throw new IllegalArgumentException(
                    "Antecedência mínima deve estar entre 0 e 10080 minutos");
        }
        if (dados.limiteAgendamentoDias() == null
                || dados.limiteAgendamentoDias() < 1
                || dados.limiteAgendamentoDias() > 365) {
            throw new IllegalArgumentException(
                    "Limite de agendamento deve estar entre 1 e 365 dias");
        }
    }
}
