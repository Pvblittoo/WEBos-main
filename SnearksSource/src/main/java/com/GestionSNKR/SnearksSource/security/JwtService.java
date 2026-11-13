package com.GestionSNKR.SnearksSource.security;

import com.GestionSNKR.SnearksSource.model.Cliente;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/**
 * Genera y verifica los JWT de la aplicación.
 *
 * Se emiten dos tipos de token:
 *  - ACCESS: vida corta (15 min). Se envía en el header Authorization: Bearer.
 *  - REFRESH: vida larga (7 días). Viaja solo en una cookie HttpOnly y sirve
 *    únicamente para pedir un nuevo token de acceso.
 *
 * Ambos van firmados con HMAC-SHA256 y llevan la versión de token del cliente,
 * para poder revocarlos al cerrar sesión.
 */
@Service
public class JwtService {

    public static final String TIPO_ACCESS = "access";
    public static final String TIPO_REFRESH = "refresh";

    private static final String ISSUER = "facture-sneakers-api";

    private final SecretKey clave;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secretoBase64,
            @Value("${app.jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {

        this.clave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretoBase64));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generarAccessToken(Cliente cliente) {
        return generar(cliente, TIPO_ACCESS, accessExpirationMs);
    }

    public String generarRefreshToken(Cliente cliente) {
        return generar(cliente, TIPO_REFRESH, refreshExpirationMs);
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    private String generar(Cliente cliente, String tipo, long duracionMs) {
        Date ahora = new Date();

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .subject(cliente.getEmail())
                .claim("id", cliente.getId())
                .claim("rol", cliente.getRol().name())
                .claim("tipo", tipo)
                .claim("ver", cliente.versionToken())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + duracionMs))
                .signWith(clave, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Verifica firma, emisor, expiración y tipo del token.
     * Devuelve los claims solo si todo es válido.
     */
    public Optional<Claims> validar(String token, String tipoEsperado) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(clave)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Evita que un refresh token se use como access token (y viceversa)
            if (!tipoEsperado.equals(claims.get("tipo", String.class))) {
                return Optional.empty();
            }

            return Optional.of(claims);

        } catch (JwtException | IllegalArgumentException e) {
            // Firma inválida, token expirado, mal formado, etc.
            return Optional.empty();
        }
    }

    public static int version(Claims claims) {
        Integer ver = claims.get("ver", Integer.class);
        return ver == null ? 0 : ver;
    }
}