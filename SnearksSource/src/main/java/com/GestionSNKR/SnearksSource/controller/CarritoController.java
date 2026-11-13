package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.DTO.AgregarCarritoRequest;
import com.GestionSNKR.SnearksSource.model.Carrito;
import com.GestionSNKR.SnearksSource.security.VerificadorAcceso;
import com.GestionSNKR.SnearksSource.service.CarritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Carrito de compras de cada cliente.
 *
 * Requiere JWT. Además, VerificadorAcceso comprueba que el clienteId de la URL
 * sea el del usuario autenticado (o que sea ADMIN). Así un cliente no puede
 * ver ni modificar el carrito de otro cambiando el número en la URL.
 */
@RestController
@RequestMapping("/api/clientes/{clienteId}/carrito")
@Tag(name = "Carrito", description = "Carrito de compras del cliente autenticado")
public class CarritoController {

    private final CarritoService carritoService;
    private final VerificadorAcceso verificadorAcceso;

    public CarritoController(CarritoService carritoService, VerificadorAcceso verificadorAcceso) {
        this.carritoService = carritoService;
        this.verificadorAcceso = verificadorAcceso;
    }

    @GetMapping
    @Operation(summary = "Obtener el carrito del cliente")
    public ResponseEntity<Carrito> obtenerCarritoCliente(
            @PathVariable Long clienteId,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        return ResponseEntity.ok(carritoService.obtenerCarrito(clienteId));
    }

    @PostMapping("/items")
    @Operation(summary = "Agregar un producto al carrito")
    public ResponseEntity<?> agregarProductoCliente(
            @PathVariable Long clienteId,
            @RequestBody AgregarCarritoRequest request,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        try {
            Carrito carrito = carritoService.agregarProducto(
                    clienteId,
                    request.getProductoId(),
                    request.getCantidad(),
                    request.getTalla()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(carrito);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/items/{productoId}")
    @Operation(summary = "Cambiar la cantidad de un producto del carrito")
    public ResponseEntity<?> actualizarCantidadCliente(
            @PathVariable Long clienteId,
            @PathVariable Long productoId,
            @RequestBody AgregarCarritoRequest request,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        try {
            request.setProductoId(productoId);
            Carrito carrito = carritoService.actualizarCantidad(
                    clienteId,
                    request.getProductoId(),
                    request.getCantidad(),
                    request.getTalla()
            );
            return ResponseEntity.ok(carrito);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/items/{productoId}")
    @Operation(summary = "Eliminar un producto del carrito")
    public ResponseEntity<?> eliminarProductoCliente(
            @PathVariable Long clienteId,
            @PathVariable Long productoId,
            @RequestParam(required = false) String talla,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        try {
            Carrito carrito = carritoService.eliminarProducto(clienteId, productoId, talla);
            return ResponseEntity.ok(carrito);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    @Operation(summary = "Vaciar el carrito")
    public ResponseEntity<Carrito> vaciarCarritoCliente(
            @PathVariable Long clienteId,
            Authentication auth) {

        verificadorAcceso.verificarPropietario(clienteId, auth);
        return ResponseEntity.ok(carritoService.vaciarCarrito(clienteId));
    }
}