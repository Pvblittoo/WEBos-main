
package com.GestionSNKR.SnearksSource.service;

import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.model.Rol;
import com.GestionSNKR.SnearksSource.repository.ClienteRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository repo;
    private final PasswordEncoder passwordEncoder;

    public ClienteService(
            ClienteRepository repo,
            PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Cliente> findAll() {
        return repo.findAll();
    }

    public Optional<Cliente> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<Cliente> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    // Registro normal: siempre crea CLIENTE.
    public Cliente save(Cliente c) {
        c.setId(null);
        c.setRol(Rol.CLIENTE);

        c.setContrasena(
                passwordEncoder.encode(c.getContrasena())
        );

        return repo.save(c);
    }

    // Crear un administrador nuevo.
    public Cliente crearAdministrador(Cliente c) {
        if (c.getNombreCompleto() == null
                || c.getNombreCompleto().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre es obligatorio"
            );
        }

        if (c.getEmail() == null || c.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "El correo es obligatorio"
            );
        }

        if (c.getContrasena() == null
                || c.getContrasena().isBlank()) {
            throw new IllegalArgumentException(
                    "La contraseña es obligatoria"
            );
        }

        String email = c.getEmail().trim();

        if (repo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario con ese correo"
            );
        }

        c.setId(null);
        c.setEmail(email);
        c.setRol(Rol.ADMIN);

        c.setContrasena(
                passwordEncoder.encode(c.getContrasena())
        );

        return repo.save(c);
    }

    // Convertir un cliente existente en administrador.
    public Cliente promoverAdministrador(Long id) {
        Cliente existente = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cliente no encontrado"
                        )
                );

        existente.setRol(Rol.ADMIN);

        return repo.save(existente);
    }

    public Cliente update(Long id, Cliente c) {
        Cliente existente = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cliente no encontrado"
                        )
                );

        // La actualización normal no cambia el rol.
        c.setId(existente.getId());
        c.setRol(existente.getRol());

        if (c.getContrasena() == null
                || c.getContrasena().isBlank()) {
            c.setContrasena(existente.getContrasena());
        } else {
            c.setContrasena(
                    passwordEncoder.encode(c.getContrasena())
            );
        }

        return repo.save(c);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public Optional<Cliente> login(
            String email,
            String contrasena) {

        Optional<Cliente> clienteOpt =
                repo.findByEmail(email);

        if (clienteOpt.isEmpty()) {
            return Optional.empty();
        }

        Cliente cliente = clienteOpt.get();

        if (!passwordEncoder.matches(
                contrasena,
                cliente.getContrasena())) {
            return Optional.empty();
        }

        return Optional.of(cliente);
    }
}
