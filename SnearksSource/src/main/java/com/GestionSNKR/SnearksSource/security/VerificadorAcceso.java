package com.GestionSNKR.SnearksSource.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Evita que un cliente acceda a recursos de otro cliente cambiando el id de
 * la URL (por ejemplo /api/clientes/5/boletas). Solo el dueño del recurso o
 * un ADMIN pueden continuar; en cualquier otro caso se responde 403.
 */
@Component
public class VerificadorAcceso {

    public void verificarPropietario(Long clienteId, Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof UsuarioAutenticado usuario)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }

        if (usuario.esAdmin()) {
            return;
        }

        if (!usuario.id().equals(clienteId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes acceder a recursos de otro cliente");
        }
    }
}