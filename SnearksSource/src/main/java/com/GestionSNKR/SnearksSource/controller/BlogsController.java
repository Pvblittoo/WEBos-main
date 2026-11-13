package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.model.Blogs;
import com.GestionSNKR.SnearksSource.service.BlogsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@Tag(name = "Blogs", description = "Noticias de la tienda. Lectura pública; escritura solo ADMIN")
public class BlogsController {

    private final BlogsService service;

    @Autowired
    public BlogsController(BlogsService service) {
        this.service = service;
    }

    @GetMapping
    @SecurityRequirements
    @Operation(summary = "Listar blogs")
    public List<Blogs> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @SecurityRequirements
    @Operation(summary = "Obtener blog por ID")
    public ResponseEntity<Blogs> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Crear blog (ADMIN)")
    public ResponseEntity<Blogs> create(@RequestBody Blogs blog) {
        Blogs saved = service.save(blog);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar blog (ADMIN)")
    public ResponseEntity<Blogs> update(@PathVariable Long id, @RequestBody Blogs blog) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Blogs updated = service.update(id, blog);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar blog (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
