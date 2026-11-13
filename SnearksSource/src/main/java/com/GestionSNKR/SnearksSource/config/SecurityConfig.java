package com.GestionSNKR.SnearksSource.config;

import com.GestionSNKR.SnearksSource.repository.ClienteRepository;
import com.GestionSNKR.SnearksSource.security.JwtAuthFilter;
import com.GestionSNKR.SnearksSource.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

/**
 * Seguridad de la API.
 *
 * - Autenticación sin estado (STATELESS) basada en JWT: el servidor no guarda
 *   sesiones; cada petición trae su token en el header Authorization.
 * - Autorización por rol (CLIENTE / ADMIN) a nivel de URL y de método.
 * - CORS restringido al frontend React (http://localhost:5173).
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            ClienteRepository clienteRepository) throws Exception {

        http
                // El JWT viaja en un header, no en una cookie de sesión, así que
                // CSRF no aplica. La cookie de refresh es HttpOnly + SameSite=Strict.
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                // Sin sesiones en el servidor
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Permite que la consola H2 se muestre (usa iframes)
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))

                .authorizeHttpRequests(auth -> auth

                        // Errores y preflight CORS
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Swagger y consola H2 (desarrollo)
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/h2-console/**"
                        ).permitAll()

                        // Registro, login, renovación de token y cierre de sesión
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/clientes",
                                "/api/clientes/login",
                                "/api/clientes/refresh",
                                "/api/clientes/logout"
                        ).permitAll()

                        // Catálogo y blogs: lectura pública
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/productos",
                                "/api/productos/**",
                                "/api/blogs",
                                "/api/blogs/**"
                        ).permitAll()

                        // Productos y blogs: crear, editar y eliminar solo ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/productos", "/api/productos/**",
                                "/api/blogs", "/api/blogs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**",
                                "/api/blogs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**",
                                "/api/blogs/**").hasRole("ADMIN")

                        // Panel de administración
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Carrito, boletas y perfil: usuario autenticado
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) ->
                                escribirError(response, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Debes iniciar sesión o tu token expiró"))
                        .accessDeniedHandler((request, response, e) ->
                                escribirError(response, HttpServletResponse.SC_FORBIDDEN,
                                        "No tienes permisos para este recurso"))
                )

                // Valida el JWT antes del filtro estándar de usuario/contraseña
                .addFilterBefore(
                        new JwtAuthFilter(jwtService, clienteRepository),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // Respuesta de error en JSON
    private static void escribirError(HttpServletResponse response, int status, String mensaje)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":" + status + ",\"mensaje\":\"" + mensaje + "\"}");
    }

    // Conexión con el frontend React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // Necesario para que el navegador envíe la cookie HttpOnly del refresh token
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}