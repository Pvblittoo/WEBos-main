
package com.GestionSNKR.SnearksSource.config;

import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.model.Rol;
import com.GestionSNKR.SnearksSource.repository.ClienteRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Configuration
@Profile("activar-admin-local")
public class ActivarAdmin {

    @Bean
    public CommandLineRunner configurarCuentasAdministradoras(
            ClienteRepository clienteRepository) {

        return args -> {

            List<String> correos = List.of(
                    "adriano.flores.hailton45@gmail.com",
                    "fran.aguirreriquelme@gmail.com",
                    "fr.aguirrer@duocuc.cl",
                    "ruizn.5173@gmail.com"

            );

            for (String correo : correos) {

                Cliente cliente = clienteRepository
                        .findByEmail(correo)
                        .orElse(null);

                if (cliente == null) {
                    System.out.println(
                            "ADMIN: No se encontró la cuenta: " + correo
                    );
                    continue;
                }

                if (cliente.getRol() == Rol.ADMIN) {
                    System.out.println(
                            "ADMIN: La cuenta ya es administradora: " + correo
                    );
                    continue;
                }

                cliente.setRol(Rol.ADMIN);
                clienteRepository.save(cliente);

                System.out.println(
                        "ADMIN: Cuenta activada correctamente: " + correo
                );
            }
        };
    }
}
