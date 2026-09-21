package com.timeright.tcc.controller;
import java.util.List;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import com.timeright.tcc.services.SalaoFotoService;

@RestController
@RequestMapping("/saloes/{salaoId}/fotos")
public class SalaoFotoController {
    private final SalaoFotoService service;
    public SalaoFotoController(SalaoFotoService service) { this.service = service; }
    @GetMapping
    public List<SalaoFotoService.Foto> listar(@PathVariable Long salaoId) { return service.listar(salaoId); }
    @GetMapping("/{fotoId}/imagem")
    public ResponseEntity<byte[]> imagem(@PathVariable Long salaoId, @PathVariable Long fotoId) {
        var foto = service.imagem(salaoId, fotoId);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(foto.getTipo()))
            .cacheControl(CacheControl.noStore()).header("X-Content-Type-Options", "nosniff")
            .body(foto.getConteudo());
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<SalaoFotoService.Foto> enviar(@PathVariable Long salaoId,
            @RequestParam("arquivos") List<MultipartFile> arquivos) { return service.enviar(salaoId, arquivos); }
    @PutMapping(value = "/{fotoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<SalaoFotoService.Foto> substituir(@PathVariable Long salaoId, @PathVariable Long fotoId,
            @RequestParam("arquivo") MultipartFile arquivo) { return service.substituir(salaoId, fotoId, arquivo); }
    @PatchMapping("/{fotoId}/principal")
    public List<SalaoFotoService.Foto> principal(@PathVariable Long salaoId, @PathVariable Long fotoId) {
        return service.principal(salaoId, fotoId);
    }
    @DeleteMapping("/{fotoId}")
    public List<SalaoFotoService.Foto> remover(@PathVariable Long salaoId, @PathVariable Long fotoId) {
        return service.remover(salaoId, fotoId);
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> indisponivel(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> tamanho() {
        return ResponseEntity.status(413).body(Map.of("error", "Envio excedeu o limite. Cada foto deve ter até 5 MB."));
    }
}
