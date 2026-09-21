package com.timeright.tcc.services;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import com.timeright.tcc.dto.LocalizacaoResponse;
import com.timeright.tcc.integration.GeocodingGateway;
import com.timeright.tcc.model.entity.Salao;

/** One shared provider/cache per backend process. Deploy only one geocoding instance. */
@Service
public class GeocodingService {
    private record Entry(LocalizacaoResponse result, long expires) {}
    private final LinkedHashMap<String, Entry> cache = new LinkedHashMap<>(16, .75f, true);
    private final ReentrantLock providerLock = new ReentrantLock();
    private final GeocodingGateway gateway;
    private long nextRequest;
    private long unavailableUntil;

    public GeocodingService(GeocodingGateway gateway) { this.gateway = gateway; }

    public LocalizacaoResponse localizar(Salao salao) {
        String address = Stream.of(salao.getLogradouro(), salao.getNumero(), salao.getBairro(),
                salao.getCidade(), salao.getUf(), salao.getCep()).map(GeocodingService::clean)
                .filter(s -> !s.isEmpty()).collect(java.util.stream.Collectors.joining(", "));
        // Legacy free text cannot establish whether street, number and municipality are complete.
        if (Stream.of(salao.getLogradouro(), salao.getNumero(), salao.getCidade(), salao.getUf())
                .anyMatch(s -> clean(s).isEmpty()))
            return LocalizacaoResponse.semPonto("INCOMPLETE", clean(salao.getEndereco()));
        String key = address.toLowerCase(Locale.ROOT);
        var cached = cached(key);
        if (cached != null) return cached;
        boolean locked = false;
        try {
            locked = providerLock.tryLock(7, TimeUnit.SECONDS);
            if (!locked) return LocalizacaoResponse.semPonto("UNAVAILABLE", address);
            cached = cached(key);
            if (cached != null) return cached;
            if (System.nanoTime() < unavailableUntil) return LocalizacaoResponse.semPonto("UNAVAILABLE", address);
            long wait = nextRequest - System.nanoTime();
            if (wait > 0) TimeUnit.NANOSECONDS.sleep(wait);
            LocalizacaoResponse result;
            try {
                result = gateway.consultar(address);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                result = LocalizacaoResponse.semPonto("UNAVAILABLE", address);
            } catch (Exception ex) {
                result = LocalizacaoResponse.semPonto("UNAVAILABLE", address);
            } finally {
                // Conservatively wait one full second after completion, including failed requests.
                nextRequest = System.nanoTime() + Duration.ofSeconds(1).toNanos();
            }
            long ttl = switch (result.status()) {
                case "FOUND" -> Duration.ofDays(7).toNanos();
                case "NOT_FOUND" -> Duration.ofHours(1).toNanos();
                default -> Duration.ofMinutes(1).toNanos();
            };
            if (result.status().equals("UNAVAILABLE")) unavailableUntil = System.nanoTime() + ttl;
            synchronized (cache) {
                cache.put(key, new Entry(result, System.nanoTime() + ttl));
                if (cache.size() > 2000) cache.remove(cache.keySet().iterator().next());
            }
            return result;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return LocalizacaoResponse.semPonto("UNAVAILABLE", address);
        } finally {
            if (locked) providerLock.unlock();
        }
    }

    private LocalizacaoResponse cached(String key) {
        synchronized (cache) {
            var entry = cache.get(key);
            if (entry == null) return null;
            if (entry.expires() > System.nanoTime()) return entry.result();
            cache.remove(key);
            return null;
        }
    }

    private static String clean(String value) { return value == null ? "" : value.trim().replaceAll("\\s+", " "); }
}
