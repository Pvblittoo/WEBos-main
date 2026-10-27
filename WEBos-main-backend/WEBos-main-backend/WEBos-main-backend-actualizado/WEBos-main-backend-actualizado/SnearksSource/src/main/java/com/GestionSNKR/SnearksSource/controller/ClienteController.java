
package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.DTO.LoginDTO;
import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.service.ClienteService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class ClienteController {

    private final ClienteService service;
    private final AuthenticationManager authenticationManager;

    public ClienteController(
            ClienteService service,
            AuthenticationManager authenticationManager) {

        this.service = service;
        this.authenticationManager = authenticationManager;
    }

    // REGISTRAR CLIENTE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Cliente c) {

        if (c.getEmail() == null ||
                c.getEmail().isBlank() ||
                c.getContrasena() == null ||
                c.getContrasena().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Correo y contraseña son obligatorios");
        }

        if (service.findByEmail(c.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("El correo ya está registrado");
        }

        Cliente saved = service.save(c);

        return ResponseEntity.ok(
                datosCliente(saved)
        );
    }

    // INICIAR SESIÓN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginDTO loginDTO,
            HttpServletRequest request) {

        if (loginDTO.getEmail() == null ||
                loginDTO.getEmail().isBlank() ||
                loginDTO.getContrasena() == null ||
                loginDTO.getContrasena().isBlank()) {

            return ResponseEntity.badRequest()
                    .body("Correo y contraseña son obligatorios");
        }

        try {

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    loginDTO.getEmail().trim(),
                                    loginDTO.getContrasena()
                            )
                    );

            // Crear el contexto de seguridad
            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);

            SecurityContextHolder.setContext(context);

            // Crear sesión antes de cambiar su ID
            HttpSession session = request.getSession(true);
            request.changeSessionId();

            // Guardar la autenticación
            session.setAttribute(
                    HttpSessionSecurityContextRepository
                            .SPRING_SECURITY_CONTEXT_KEY,
                    context
            );

            Cliente cliente = service.findByEmail(
                    authentication.getName()
            ).orElseThrow();

            return ResponseEntity.ok(
                    datosCliente(cliente)
            );

        } catch (AuthenticationException e) {

            return ResponseEntity.status(401)
                    .body("Correo o contraseña incorrectos");
        }
    }

    // CERRAR SESIÓN
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request) {

        HttpSession session =
                request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("mensaje", "Sesión cerrada correctamente")
        );
    }

    // DATOS DEL USUARIO AUTENTICADO
    @GetMapping("/me")
    public ResponseEntity<?> me(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity.status(401)
                    .body("No autenticado");
        }

        return service.findByEmail(
                authentication.getName()
        ).<ResponseEntity<?>>map(cliente ->
                ResponseEntity.ok(datosCliente(cliente))
        ).orElseGet(() ->
                ResponseEntity.status(404)
                        .body("Cliente no encontrado")
        );
    }

    // RESPUESTA SIN CONTRASEÑA
    private Map<String, Object> datosCliente(
            Cliente cliente) {

        return Map.of(
                "id", cliente.getId(),
                "nombreCompleto", cliente.getNombreCompleto(),
                "email", cliente.getEmail(),
                "rol", cliente.getRol().name()
        );
    }
}
