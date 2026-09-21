package com.timeright.tcc.services;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.net.http.HttpTimeoutException;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import com.timeright.tcc.dto.LocalizacaoResponse;
import com.timeright.tcc.integration.GeocodingGateway;
import com.timeright.tcc.model.entity.Salao;

class GeocodingServiceTest {
    static Salao salon(String street) {
        var s = new Salao();
        s.setLogradouro(street); s.setNumero("100"); s.setCidade("Barueri"); s.setUf("SP");
        return s;
    }

    @Test void differentSalonsAndChangedAddressUseDifferentCacheKeys() throws Exception {
        var gateway = mock(GeocodingGateway.class);
        when(gateway.consultar(anyString())).thenAnswer(inv -> LocalizacaoResponse.semPonto("NOT_FOUND", inv.getArgument(0)));
        var service = new GeocodingService(gateway);
        var a = salon("Rua A"); var b = salon("Rua B");
        assertThat(service.localizar(a).enderecoConsultado()).contains("Rua A");
        assertThat(service.localizar(b).enderecoConsultado()).contains("Rua B");
        service.localizar(a);
        a.setNumero("200");
        assertThat(service.localizar(a).enderecoConsultado()).contains("200");
        verify(gateway, times(3)).consultar(anyString());
    }

    @Test void incompleteAddressNeverCallsProviderOrInventsPoint() {
        var gateway = mock(GeocodingGateway.class);
        var s = salon("Rua A"); s.setCidade("");
        var result = new GeocodingService(gateway).localizar(s);
        assertThat(result.status()).isEqualTo("INCOMPLETE");
        assertThat(result.latitude()).isNull();
        verifyNoInteractions(gateway);
    }

    @Test void successIsCachedAcrossEquivalentAddresses() throws Exception {
        var gateway = mock(GeocodingGateway.class);
        var expected = new LocalizacaoResponse("FOUND", "address", "provider address", -23.5, -46.6);
        when(gateway.consultar(anyString())).thenReturn(expected);
        var service = new GeocodingService(gateway);
        assertThat(service.localizar(salon("Rua A"))).isEqualTo(expected);
        assertThat(service.localizar(salon("  rua   a  "))).isEqualTo(expected);
        verify(gateway).consultar(anyString());
    }

    @Test void timeoutIsCachedAndOpensProviderCooldown() throws Exception {
        var gateway = mock(GeocodingGateway.class);
        when(gateway.consultar(anyString())).thenThrow(new HttpTimeoutException("timeout"));
        var service = new GeocodingService(gateway);
        var result = service.localizar(salon("Rua A"));
        assertThat(result.status()).isEqualTo("UNAVAILABLE");
        assertThat(result.latitude()).isNull();
        service.localizar(salon("Rua A"));
        assertThat(service.localizar(salon("Rua B")).status()).isEqualTo("UNAVAILABLE");
        verify(gateway).consultar(anyString());
    }

    @Test void concurrentQueriesAreDeduplicatedAndSpacedByAtLeastOneSecond() throws Exception {
        var starts = new ArrayList<Long>();
        GeocodingGateway gateway = address -> {
            starts.add(System.nanoTime());
            return LocalizacaoResponse.semPonto("NOT_FOUND", address);
        };
        var service = new GeocodingService(gateway);
        var executor = Executors.newFixedThreadPool(3);
        try {
            var a = executor.submit(() -> service.localizar(salon("Rua A")));
            var duplicate = executor.submit(() -> service.localizar(salon("Rua A")));
            var b = executor.submit(() -> service.localizar(salon("Rua B")));
            a.get(); duplicate.get(); b.get();
            assertThat(starts).hasSize(2);
            assertThat(starts.get(1) - starts.get(0)).isGreaterThanOrEqualTo(1_000_000_000L);
        } finally { executor.shutdownNow(); }
    }
}
