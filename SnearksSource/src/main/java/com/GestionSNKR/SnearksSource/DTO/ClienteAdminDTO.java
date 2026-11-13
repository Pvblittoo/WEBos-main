
package com.GestionSNKR.SnearksSource.DTO;

import com.GestionSNKR.SnearksSource.model.Cliente;

public record ClienteAdminDTO(
        Long id,
        String nombreCompleto,
        String email,
        String numero,
        String region,
        String comuna,
        String rol
) {
    public static ClienteAdminDTO desdeCliente(Cliente cliente) {
        return new ClienteAdminDTO(
                cliente.getId(),
                cliente.getNombreCompleto(),
                cliente.getEmail(),
                cliente.getNumero(),
                cliente.getRegion(),
                cliente.getComuna(),
                cliente.getRol() != null
                        ? cliente.getRol().name()
                        : "CLIENTE"
        );
    }
}
