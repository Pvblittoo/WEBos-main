package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.DTO.CheckoutRequest;
import com.GestionSNKR.SnearksSource.model.Boleta;
import com.GestionSNKR.SnearksSource.security.VerificadorAcceso;
import com.GestionSNKR.SnearksSource.service.BoletaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Compras (boletas) de un cliente.
 *
 * Requiere JWT y solo el dueño de las boletas (o un ADMIN) puede verlas
 * o crear una nueva compra a su nombre.
 */
@RestController
@RequestMapping("/api/clientes/{clienteId}/boletas")
@Tag(name = "Boletas del cliente", description = "Checkout e historial de compras")
public class BoletaController {

    private final BoletaService boletaService;
    private final VerificadorAcceso verificadorAcceso;

    public BoletaController(BoletaService boletaService, VerificadorAcceso verificadorAcceso) {
        this.boletaService = boletaService;
        this.verificadorAcceso = verificadorAcceso;
    }

    @PostMapping
    @Operation(summary = "Confirmar compra (checkout)",
            description = "Convierte el carrito del cliente en una boleta y vacía el carrito.")
    public ResponseEntity<?> crearBoleta(
            @PathVariable Long clienteId,
            @RequestBody CheckoutRequest request,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        try {
            Boleta boleta = boletaService.crearDesdeCarrito(
                    clienteId, request.getMetodoPago(), request.getDireccion());
            return ResponseEntity.status(HttpStatus.CREATED).body(boleta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Listar las compras del cliente")
    public ResponseEntity<List<Boleta>> listarBoletas(
            @PathVariable Long clienteId,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        return ResponseEntity.ok(boletaService.listarPorCliente(clienteId));
    }

    @GetMapping("/{boletaId}")
    @Operation(summary = "Ver el detalle de una compra")
    public ResponseEntity<?> obtenerBoleta(
            @PathVariable Long clienteId,
            @PathVariable Long boletaId,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        try {
            Boleta b = boletaService.obtener(clienteId, boletaId);
            return ResponseEntity.ok(b);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}