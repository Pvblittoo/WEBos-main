
package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.model.Boleta;
import com.GestionSNKR.SnearksSource.service.BoletaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/boletas")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBoletaController {

    private final BoletaService boletaService;

    public AdminBoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    @GetMapping
    public ResponseEntity<List<Boleta>> listarTodas() {
        return ResponseEntity.ok(boletaService.listarTodas());
    }

    @PutMapping("/{boletaId}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long boletaId,
            @RequestBody Map<String, String> datos) {

        try {
            String nuevoEstado = datos.get("estado");

            Boleta actualizada = boletaService.actualizarEstado(
                    boletaId, nuevoEstado
            );

            return ResponseEntity.ok(actualizada);

        } catch (IllegalArgumentException e) {
            HttpStatus status = "Pedido no encontrado.".equals(e.getMessage())
                    ? HttpStatus.NOT_FOUND
                    : HttpStatus.BAD_REQUEST;

            return ResponseEntity.status(status)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
