
package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.DTO.ClienteAdminDTO;
import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.service.ClienteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/clientes")
public class AdminClienteController {

    private final ClienteService clienteService;

    public AdminClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Listar todos los clientes y administradores.
    @GetMapping
    public ResponseEntity<List<ClienteAdminDTO>> listarClientes() {
        List<ClienteAdminDTO> clientes = clienteService.findAll()
                .stream()
                .map(ClienteAdminDTO::desdeCliente)
                .toList();

        return ResponseEntity.ok(clientes);
    }

    // Crear un administrador nuevo.
    @PostMapping("/administradores")
    public ResponseEntity<?> crearAdministrador(
            @RequestBody Cliente cliente) {
        try {
            Cliente guardado =
                    clienteService.crearAdministrador(cliente);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ClienteAdminDTO.desdeCliente(guardado));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // Convertir un cliente existente en administrador.
    @PutMapping("/{id}/administrador")
    public ResponseEntity<?> promoverAdministrador(
            @PathVariable Long id) {
        try {
            Cliente actualizado =
                    clienteService.promoverAdministrador(id);

            return ResponseEntity.ok(
                    ClienteAdminDTO.desdeCliente(actualizado)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}
