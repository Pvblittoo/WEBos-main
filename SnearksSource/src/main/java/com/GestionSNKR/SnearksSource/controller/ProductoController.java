package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.model.Producto;
import com.GestionSNKR.SnearksSource.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@Tag(name = "Productos", description = "Catálogo de zapatillas. Lectura pública; crear, editar y eliminar requiere rol ADMIN")
public class ProductoController {

    private final ProductoService productoService;

    @Autowired
    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @SecurityRequirements
    @Operation(summary = "Listar todos los productos")
    public ResponseEntity<List<Producto>> obtenerTodos() {
        List<Producto> productos = productoService.obtenerTodos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/categoria/jordan")
    @SecurityRequirements
    @Operation(summary = "Listar productos Jordan")
    public ResponseEntity<List<Producto>> obtenerCategoriaJordan() {
        List<Producto> productos = productoService.obtenerPorCategoria("jordan");
        return ResponseEntity.ok(productos);
    }
    @GetMapping("/categoria/sports")
    @SecurityRequirements
    @Operation(summary = "Listar productos Nike Sports")
    public ResponseEntity<List<Producto>> obtenerCategoriaSports() {
        List<Producto> productos = productoService.obtenerPorCategoria("Nike Sports");
        return ResponseEntity.ok(productos);
    }
    @GetMapping("/categoria/urban")
    @SecurityRequirements
    @Operation(summary = "listar productos Nike Urban")
    public ResponseEntity<List<Producto>> obtenerCategoriaUrban() {
        List<Producto> productos = productoService.obtenerPorCategoria("Nike Urban");
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    @SecurityRequirements
    @Operation(summary = "Obtener un producto por ID")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Crear producto (ADMIN)")
    public ResponseEntity<Producto> guardarProducto(@RequestBody Producto producto) {
        Producto nuevoProducto = productoService.guardarProducto(producto);
        return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto (ADMIN)")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            Producto productoActualizado = productoService.actualizarProducto(id, producto);
            return ResponseEntity.ok(productoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto (ADMIN)")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        if (productoService.eliminarProducto(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}