
package com.GestionSNKR.SnearksSource.config;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    // Encriptación de contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception{
        return configuration.getAuthenticationManager();
    }

    // Seguridad de la aplicación
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // Solo para desarrollo local
                .csrf(csrf -> csrf.disable())

                // Configuración CORS
                .cors(Customizer.withDefaults())

                // Permisos
                .authorizeHttpRequests(auth -> auth

                        // Registro y login
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/clientes",
                                "/api/clientes/login",
                                "/api/clientes/registro"
                        ).permitAll()

                        // Catálogo y blogs públicos
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/productos",
                                "/api/productos/**",
                                "/api/blogs",
                                "/api/blogs/**"
                        ).permitAll()

                        // Agregar productos: ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/productos",
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        // Editar productos: ADMIN
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/productos",
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        // Eliminar productos: ADMIN
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/productos",
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        // Administración
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // Carrito y pedidos
                        .requestMatchers(
                                "/api/clientes/*/carrito",
                                "/api/clientes/*/carrito/**",
                                "/api/clientes/*/boletas",
                                "/api/clientes/*/boletas/**"
                        ).authenticated()

                        // Resto de peticiones
                        .anyRequest().authenticated()
                )

                // Mensajes de acceso
                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint(
                                (request, response, exception) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_UNAUTHORIZED,
                                            "Debes iniciar sesión"
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, exception) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_FORBIDDEN,
                                            "No tienes permisos"
                                    );
                                }
                        )
                );

        return http.build();
    }

    // Permitir conexión con React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("*")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }
}
