package com.GestionSNKR.SnearksSource.controller;

import com.GestionSNKR.SnearksSource.DTO.LoginDTO;
import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.security.JwtService;
import com.GestionSNKR.SnearksSource.service.ClienteService;
import io.jsonwebtoken.Claims;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Registro y autenticación de clientes con JWT.
 *
 * Flujo:
 *  - login   -> devuelve accessToken (JSON) + refreshToken (cookie HttpOnly)
 *  - refresh -> con la cookie, entrega un accessToken nuevo y rota el refresh
 *  - logout  -> revoca todos los tokens del usuario y borra la cookie
 *  - me      -> datos del usuario dueño del accessToken
 */
@RestController
@RequestMapping("/api/clientes")
@Tag(name = "Autenticación y clientes", description = "Registro, login, renovación de token y sesión")
public class ClienteController {

    public static final String COOKIE_REFRESH = "refresh_token";

    private final ClienteService service;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final boolean cookieSegura;

    public ClienteController(
            ClienteService service,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            @Value("${app.jwt.cookie-secure:false}") boolean cookieSegura) {

        this.service = service;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.cookieSegura = cookieSegura;
    }

    // REGISTRAR CLIENTE (siempre con rol CLIENTE)
    @PostMapping
    @SecurityRequirements
    @Operation(summary = "Registrar un cliente nuevo",
            description = "Crea la cuenta con rol CLIENTE. La contraseña se guarda cifrada con BCrypt.")
    public ResponseEntity<?> create(@RequestBody Cliente c) {

        if (c.getEmail() == null || c.getEmail().isBlank()
                || c.getContrasena() == null || c.getContrasena().isBlank()) {
            return ResponseEntity.badRequest().body("Correo y contraseña son obligatorios");
        }

        c.setEmail(c.getEmail().trim());

        if (service.findByEmail(c.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }

        Cliente saved = service.save(c);
        return ResponseEntity.ok(datosCliente(saved));
    }

    // INICIAR SESIÓN
    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Iniciar sesión",
            description = "Valida credenciales y entrega un accessToken JWT (15 min). "
                    + "El refreshToken (7 días) se envía en una cookie HttpOnly.")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDTO.getEmail().trim(),
                            loginDTO.getContrasena()));

            Cliente cliente = service.findByEmail(authentication.getName()).orElseThrow();
            return respuestaConTokens(cliente);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Correo o contraseña incorrectos");
        }
    }

    // RENOVAR TOKEN
    @PostMapping("/refresh")
    @SecurityRequirements
    @Operation(summary = "Renovar el token de acceso",
            description = "Usa la cookie HttpOnly refresh_token para emitir un accessToken nuevo. "
                    + "El refresh token se rota en cada uso.")
    public ResponseEntity<?> refresh(
            @CookieValue(name = COOKIE_REFRESH, required = false) String refreshToken) {

        Optional<Cliente> cliente = clienteDesdeRefresh(refreshToken);

        if (cliente.isEmpty()) {
            return ResponseEntity.status(401)
                    .header(HttpHeaders.SET_COOKIE, cookieRefresh("", Duration.ZERO).toString())
                    .body("Sesión expirada. Inicia sesión nuevamente.");
        }

        return respuestaConTokens(cliente.get());
    }

    // CERRAR SESIÓN
    @PostMapping("/logout")
    @SecurityRequirements
    @Operation(summary = "Cerrar sesión",
            description = "Revoca todos los tokens del usuario (access y refresh) y elimina la cookie.")
    public ResponseEntity<?> logout(
            @CookieValue(name = COOKIE_REFRESH, required = false) String refreshToken) {

        clienteDesdeRefresh(refreshToken).ifPresent(service::revocarTokens);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieRefresh("", Duration.ZERO).toString())
                .body(Map.of("mensaje", "Sesión cerrada correctamente"));
    }

    // DATOS DEL USUARIO AUTENTICADO
    @GetMapping("/me")
    @Operation(summary = "Datos del usuario autenticado", description = "Requiere accessToken.")
    public ResponseEntity<?> me(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }

        return service.findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(c -> ResponseEntity.ok(datosCliente(c)))
                .orElseGet(() -> ResponseEntity.status(404).body("Cliente no encontrado"));
    }

    // ---------- Apoyo ----------

    private Optional<Cliente> clienteDesdeRefresh(String refreshToken) {
        Optional<Claims> claims = jwtService.validar(refreshToken, JwtService.TIPO_REFRESH);
        if (claims.isEmpty()) {
            return Optional.empty();
        }

        // La versión debe coincidir: si el usuario cerró sesión, el refresh ya no sirve
        int version = JwtService.version(claims.get());
        return service.findByEmail(claims.get().getSubject())
                .filter(c -> c.versionToken() == version);
    }

    private ResponseEntity<?> respuestaConTokens(Cliente cliente) {
        String accessToken = jwtService.generarAccessToken(cliente);
        String refreshToken = jwtService.generarRefreshToken(cliente);

        Map<String, Object> cuerpo = new LinkedHashMap<>(datosCliente(cliente));
        cuerpo.put("accessToken", accessToken);
        cuerpo.put("tipoToken", "Bearer");
        cuerpo.put("expiraEnMs", jwtService.getAccessExpirationMs());

        Duration duracion = Duration.ofMillis(jwtService.getRefreshExpirationMs());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieRefresh(refreshToken, duracion).toString())
                .body(cuerpo);
    }

    /**
     * Cookie del refresh token:
     *  - HttpOnly: JavaScript no puede leerla (protege contra XSS).
     *  - SameSite=Strict: no se envía desde otros sitios (protege contra CSRF).
     *  - Path=/api/clientes: solo viaja a login, refresh y logout.
     */
    private ResponseCookie cookieRefresh(String valor, Duration duracion) {
        return ResponseCookie.from(COOKIE_REFRESH, valor)
                .httpOnly(true)
                .secure(cookieSegura)
                .sameSite("Strict")
                .path("/api/clientes")
                .maxAge(duracion)
                .build();
    }

    // Respuesta sin contraseña
    private Map<String, Object> datosCliente(Cliente cliente) {
        return Map.of(
                "id", cliente.getId(),
                "nombreCompleto", cliente.getNombreCompleto(),
                "email", cliente.getEmail(),
                "rol", cliente.getRol().name()
        );
    }
}