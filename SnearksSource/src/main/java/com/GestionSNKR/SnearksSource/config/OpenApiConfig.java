package com.GestionSNKR.SnearksSource.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentación de la API en Swagger UI: http://localhost:8080/swagger-ui.html
 *
 * Define el esquema "bearerAuth" para que en Swagger se pueda pegar el
 * accessToken (botón Authorize) y probar los endpoints protegidos.
 */
@Configuration
public class OpenApiConfig {

    public static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    public OpenAPI facturesneakersOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Facture Sneakers API")
                        .version("1.0.0")
                        .description("""
                                API REST de la tienda online Facture Sneakers (DSY1104).

                                **Cómo probar endpoints protegidos:**
                                1. Ejecuta `POST /api/clientes/login` con un usuario válido.
                                2. Copia el valor `accessToken` de la respuesta.
                                3. Presiona **Authorize** e ingresa el token (sin la palabra Bearer).
                                """)
                        .contact(new Contact().name("Equipo WEBos - Duoc UC")))
                .components(new Components()
                        .addSecuritySchemes(ESQUEMA_JWT, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token de acceso obtenido en /api/clientes/login")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT));
    }
}