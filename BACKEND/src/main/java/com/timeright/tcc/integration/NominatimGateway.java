package com.timeright.tcc.integration;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.dto.LocalizacaoResponse;

@Component
public class NominatimGateway implements GeocodingGateway {
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final ObjectMapper mapper;
    private final String url;
    private final String userAgent;

    public NominatimGateway(ObjectMapper mapper,
            @Value("${app.geocoding.url:https://nominatim.openstreetmap.org/search}") String url,
            @Value("${app.geocoding.user-agent:TimeRight/1.0 (salon location)}") String userAgent) {
        this.mapper = mapper;
        this.url = url;
        this.userAgent = userAgent;
    }

    @Override
    public LocalizacaoResponse consultar(String endereco) throws Exception {
        var request = HttpRequest.newBuilder(URI.create(url + "?format=jsonv2&limit=1&countrycodes=br&q="
                + URLEncoder.encode(endereco, StandardCharsets.UTF_8)))
                .timeout(Duration.ofSeconds(5)).header("User-Agent", userAgent)
                .header("Accept", "application/json").header("Accept-Language", "pt-BR").GET().build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new java.io.IOException("Geocoding HTTP " + response.statusCode());
        var results = mapper.readTree(response.body());
        if (!results.isArray()) throw new java.io.IOException("Invalid geocoding response");
        if (results.isEmpty()) return LocalizacaoResponse.semPonto("NOT_FOUND", endereco);
        var point = results.get(0);
        double lat = Double.parseDouble(point.path("lat").asText());
        double lon = Double.parseDouble(point.path("lon").asText());
        String found = point.path("display_name").asText();
        if (!Double.isFinite(lat) || !Double.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || found.isBlank())
            throw new java.io.IOException("Invalid geocoding point");
        return new LocalizacaoResponse("FOUND", endereco, found, lat, lon);
    }
}
