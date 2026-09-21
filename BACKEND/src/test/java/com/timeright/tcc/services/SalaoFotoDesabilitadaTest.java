package com.timeright.tcc.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import com.timeright.tcc.model.repository.SalaoFotoRepository;
import com.timeright.tcc.security.AuthenticatedUserService;
import jakarta.persistence.EntityManager;

class SalaoFotoDesabilitadaTest {
    @Test void recursoDesabilitadoNaoConsultaBancoNemAlteraRegistros() {
        var repository = mock(SalaoFotoRepository.class);
        var saloes = mock(SalaoService.class);
        var auth = mock(AuthenticatedUserService.class);
        var em = mock(EntityManager.class);
        var service = new SalaoFotoService(repository, saloes, auth, em, false);
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> service.listar(1L)).getStatusCode().value());
        assertThrows(ResponseStatusException.class, () -> service.imagem(1L, 1L));
        assertThrows(ResponseStatusException.class, () -> service.enviar(1L, List.of()));
        assertThrows(ResponseStatusException.class, () -> service.substituir(1L, 1L, null));
        assertThrows(ResponseStatusException.class, () -> service.principal(1L, 1L));
        assertThrows(ResponseStatusException.class, () -> service.remover(1L, 1L));
        verifyNoInteractions(repository, saloes, auth, em);
    }
}
