package com.timeright.tcc.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import java.sql.SQLException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.controller.SalaoController;
import com.timeright.tcc.dto.SalaoServicosDTO;
import com.timeright.tcc.exception.OwnershipExceptionHandler;
import com.timeright.tcc.integration.CnpjConsultaGatewayStub;
import com.timeright.tcc.model.entity.*;
import com.timeright.tcc.model.repository.*;
import com.timeright.tcc.security.*;

class SalaoCadastroTest {
    SalaoRepository saloes;
    ServicoRepository servicos;
    SalaoService service;
    MockMvc mvc;
    SalaoServicosDTO dto;
    @BeforeEach void setup() {
        saloes = mock(SalaoRepository.class);
        servicos = mock(ServicoRepository.class);
        UsuarioRepository usuarios = mock(UsuarioRepository.class);
        AuthenticatedUserService auth = mock(AuthenticatedUserService.class);
        when(auth.getCurrentUser()).thenReturn(new AuthenticatedUser(1L, "MANAGER"));
        Usuario gerente = new Usuario();
        NivelAcesso nivel = new NivelAcesso(); nivel.setNome("MANAGER");
        gerente.setNivelAcesso(nivel); gerente.setStatusUsuario("ATIVO");
        when(usuarios.findById(1L)).thenReturn(Optional.of(gerente));
        var gateway = new CnpjConsultaGatewayStub();
        service = new SalaoService(saloes, servicos, gateway, usuarios, auth);
        mvc = MockMvcBuilders.standaloneSetup(new SalaoController(service, gateway,
                mock(HorarioFuncionamentoSalaoService.class)))
                .setControllerAdvice(new OwnershipExceptionHandler()).build();
        dto = new SalaoServicosDTO();
        dto.cnpj = "11.222.333/0001-81"; dto.nome = "Salão";
        dto.email = "teste@example.com"; dto.telefone = "11999999999"; dto.endereco = "Rua Teste, 1";
        when(saloes.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
    }
    @Test void cadastroValidoNormalizaCnpjENaoInventaSituacao() throws Exception {
        dto.situacaoCadastral = "ATIVA";
        mvc.perform(post("/saloes/com-servicos").contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto)))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.data.cnpj").value("11222333000181"))
            .andExpect(jsonPath("$.data.situacaoCadastral").doesNotExist());
    }
    @Test void duplicidadeAntecipadaNaoGrava() throws Exception {
        when(saloes.existsByCnpj("11222333000181")).thenReturn(true);
        conflito(); verify(saloes, never()).saveAndFlush(any()); verifyNoInteractions(servicos);
    }
    @Test void duplicidadeLegadaComMascaraNaoGrava() throws Exception {
        when(saloes.existsByCnpj(dto.cnpj)).thenReturn(true);
        conflito(); verify(saloes, never()).saveAndFlush(any());
    }
    @Test void corridaUniqueSqlServerNaoExpoeDetalhes() throws Exception {
        when(saloes.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException(
            "INSERT SQL constraint segredo", new SQLException("segredo", "23000", 2627)));
        conflito(); verifyNoInteractions(servicos);
    }
    @Test void corridaIndiceUniqueSqlServerNaoExpoeDetalhes() throws Exception {
        when(saloes.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException(
            "INSERT SQL constraint segredo", new SQLException("segredo", "23000", 2601)));
        conflito();
    }
    @Test void corridaUniqueH2NaoExpoeDetalhes() throws Exception {
        when(saloes.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException(
            "INSERT SQL constraint segredo", new SQLException("segredo", "23505")));
        conflito();
    }
    @Test void outraRestricaoTemRespostaSegura() throws Exception {
        when(saloes.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("SQL segredo"));
        mvc.perform(post("/saloes/com-servicos").contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto)))
            .andExpect(status().isConflict()).andExpect(content().json(
                "{\"error\":\"Não foi possível salvar o salão. Confira os dados informados.\"}", true));
    }
    @Test void camposObrigatoriosInvalidosRetornam400() throws Exception {
        dto.nome = " ";
        mvc.perform(post("/saloes/com-servicos").contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto))).andExpect(status().isBadRequest());
        verify(saloes, never()).saveAndFlush(any());
    }
    @Test void cnpjInvalidoRetorna400() throws Exception {
        dto.cnpj = "11222333000182";
        mvc.perform(post("/saloes/com-servicos").contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto))).andExpect(status().isBadRequest());
        verify(saloes, never()).saveAndFlush(any());
    }
    @Test void consultaLocalNaoAtestaSituacaoExterna() {
        assertNull(service.consultarCnpj(dto.cnpj).getSituacaoCadastral());
    }
    void conflito() throws Exception {
        mvc.perform(post("/saloes/com-servicos").contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(dto)))
            .andExpect(status().isConflict()).andExpect(content().json(
                "{\"error\":\"Este CNPJ já está cadastrado no TimeRight.\"}", true));
    }
}
