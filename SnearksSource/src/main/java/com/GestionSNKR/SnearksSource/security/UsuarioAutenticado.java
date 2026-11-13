package com.GestionSNKR.SnearksSource.security;

import java.security.Principal;

/**
 * Usuario que queda en el contexto de seguridad después de validar el JWT.
 * Implementa Principal para que authentication.getName() devuelva el email.
 */
public record UsuarioAutenticado(Long id, String email, String rol) implements Principal {

    @Override
    public String getName() {
        return email;
    }

    public boolean esAdmin() {
        return "ADMIN".equals(rol);
    }
}