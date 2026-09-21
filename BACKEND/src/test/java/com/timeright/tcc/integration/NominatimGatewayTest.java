package com.timeright.tcc.integration;

import static org.assertj.core.api.Assertions.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class NominatimGatewayTest {
    @Test void parsesRealProviderShapeAndHandlesMissingInvalidAndUnavailableResponses() throws Exception {
        var body = new AtomicReference<>("[{\"lat\":\"-23.5\",\"lon\":\"-46.6\",\"display_name\":\"Rua cadastrada, Barueri\"}]");
        var agent = new AtomicReference<String>();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/search", exchange -> {
            agent.set(exchange.getRequestHeaders().getFirst("User-Agent"));
            byte[] bytes = body.get().getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(body.get().equals("unavailable") ? 503 : 200, bytes.length);
            exchange.getResponseBody().write(bytes); exchange.close();
        });
        server.start();
        try {
            var gateway = new NominatimGateway(new ObjectMapper(), "http://127.0.0.1:" + server.getAddress().getPort() + "/search", "TimeRight/test");
            var result = gateway.consultar("Rua cadastrada, 100, Barueri, SP");
            assertThat(result.status()).isEqualTo("FOUND");
            assertThat(result.latitude()).isEqualTo(-23.5);
            assertThat(result.enderecoEncontrado()).contains("Barueri");
            assertThat(agent.get()).isEqualTo("TimeRight/test");
            body.set("[]");
            assertThat(gateway.consultar("missing").status()).isEqualTo("NOT_FOUND");
            body.set("[{\"lat\":\"NaN\",\"lon\":\"-46\"}]");
            assertThatThrownBy(() -> gateway.consultar("invalid")).isInstanceOf(java.io.IOException.class);
            body.set("unavailable");
            assertThatThrownBy(() -> gateway.consultar("unavailable")).isInstanceOf(java.io.IOException.class);
        } finally { server.stop(0); }
    }
}
