package com.GestionSNKR.SnearksSource.security;

import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.repository.ClienteRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que se ejecuta una vez por petición:
 *  1. Lee el header "Authorization: Bearer <token>".
 *  2. Valida el JWT de acceso (firma, expiración, tipo).
 *  3. Comprueba en la BD que el cliente exista y que la versión del token
 *     siga vigente (si cerró sesión, el token queda revocado).
 *  4. Carga el usuario y su rol en el SecurityContext.
 *
 * Si no hay token o no es válido, la petición sigue sin autenticación y
 * Spring Security responde 401/403 según las reglas de SecurityConfig.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ClienteRepository clienteRepository;

    public JwtAuthFilter(JwtService jwtService, ClienteRepository clienteRepository) {
        this.jwtService = jwtService;
        this.clienteRepository = clienteRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            jwtService.validar(token, JwtService.TIPO_ACCESS).ifPresent(claims -> {

                Cliente cliente = clienteRepository
                        .findByEmail(claims.getSubject())
                        .orElse(null);

                boolean vigente = cliente != null
                        && cliente.versionToken() == JwtService.version(claims);

                if (vigente) {
                    // El rol se toma de la BD: si cambia, aplica de inmediato
                    String rol = cliente.getRol().name();

                    UsuarioAutenticado usuario = new UsuarioAutenticado(
                            cliente.getId(), cliente.getEmail(), rol);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    usuario,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                            );

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            });
        }

        chain.doFilter(request, response);
    }
}