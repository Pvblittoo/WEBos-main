package com.GestionSNKR.SnearksSource.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad JPA que representa un Cliente en la base de datos.
 */
@Entity
@Table(name = "cliente")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombreCompleto", length = 250, nullable = false)
    @JsonProperty("nombreCompleto")
    private String nombreCompleto;

    @Column(name = "email", length = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "contrasena", length = 255, nullable = false)
    private String contrasena;

    @Column(name = "numero", length = 9)
    private String numero;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "comuna", length = 100)
    private String comuna;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", length = 20, nullable = false)
    private Rol rol = Rol.CLIENTE;

    @JsonIgnore
    @Column(name = "token_version")
    private Integer tokenVersion = 0;

    public int versionToken(){
        return tokenVersion == null ? 0 : tokenVersion;
    }



    @OneToOne(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Carrito carrito;

}
