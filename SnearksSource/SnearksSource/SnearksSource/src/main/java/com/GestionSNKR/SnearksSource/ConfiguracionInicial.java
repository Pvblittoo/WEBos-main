package com.GestionSNKR.SnearksSource; // Ajusta el paquete si lo moviste a config

import com.GestionSNKR.SnearksSource.model.Blogs;
import com.GestionSNKR.SnearksSource.model.Producto;
import com.GestionSNKR.SnearksSource.repository.BlogsRepository;
import com.GestionSNKR.SnearksSource.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class ConfiguracionInicial {

    private static Map<String, Integer> inventarioBase() {
        return Map.of(
                "35", 1,
                "36", 2,
                "37", 4,
                "38", 5,
                "39", 3,
                "40", 4,
                "41", 2,
                "42", 1
        );
    }

    @Bean
    CommandLineRunner iniciarBaseDeDatos(ProductoRepository productoRepository, BlogsRepository blogsRepository) {
        return args -> {

            // ==========================================
            // PRECARGA DE ZAPATILLAS
            // ==========================================
            if (productoRepository.count() == 0) {
                System.out.println("Iniciando la precarga de zapatillas en la base de datos H2...");

                List<Producto> zapatillas = List.of(
                        new Producto(null, 149000, "Air Jordan Retro 1", "Zapatilla clásica Jordan Retro 1", "img/re1.png", "Jordan", inventarioBase()),
                        new Producto(null, 165000, "Air Jordan Retro 3", "Zapatilla clásica Jordan Retro 3", "img/re3.png", "Jordan", inventarioBase()),
                        new Producto(null, 175000, "Air Jordan Retro 4", "Zapatilla clásica Jordan Retro 4", "img/re4.png", "Jordan", inventarioBase()),
                        new Producto(null, 189000, "Air Jordan 5 “UNC”", "Edición especial UNC de la Jordan 5", "img/re5.png", "Jordan", inventarioBase()),
                        new Producto(null, 199000, "Air Jordan 11 Retro", "Zapatilla de baloncesto icónica Jordan 11", "img/re11.png", "Jordan", inventarioBase()),
                        new Producto(null, 210000, "Air Jordan 12 Retro", "Zapatilla de baloncesto icónica Jordan 12", "img/re12.png", "Jordan", inventarioBase()),
                        new Producto(null, 230000, "Air Jordan 13 Retro", "Zapatilla de baloncesto icónica Jordan 13", "img/re13.png", "Jordan", inventarioBase()),
                        new Producto(null, 250000, "Air Jordan 1 Low Travis Scott", "Colaboración exclusiva con Travis Scott", "img/tra1.png", "Jordan", inventarioBase()),
                        new Producto(null, 250000000, "Maxi Black Cat", "Colaboración exclusiva con Travis Scott", "img/maxi.jpg", "Viejas Desnudas", inventarioBase()),
                        new Producto(null, 149000, "Mercurial Vapor 16", "Nike", "img/imgsp/m12.png", "Nike Sports", inventarioBase()),
                        new Producto(null, 165000, "Phantom 6 Low Elite", "Nike", "img/imgsp/m2.png", "Nike Sports", inventarioBase()),
                        new Producto(null, 175000, "Mercurial Vapor 17 Elite", "Nike", "img/imgsp/m31.png", "Nike Sports", inventarioBase()),
                        new Producto(null, 189000, "Tiempo Maestro Academy", "Nike", "img/imgsp/ti.png", "Nike Sports", inventarioBase()),
                        new Producto(null, 199000, "Mercurial Superfly 11 Elite SE", "Nike", "img/imgsp/e2.png", "Nike Sports", inventarioBase()),
                        new Producto(null, 210000, "Phantom 6 Low Elite \"Alexia Putellas\"", "Nike", "img/imgsp/f1 (1).png", "Nike Sports", inventarioBase()),
                        new Producto(null, 230000, "Mercurial Superfly 11 Elite", "Nike", "img/imgsp/g1.png", "Nike Sports", inventarioBase()),
                        new Producto(null, 250000, "United Tiempo Maestro Academy", "Nike", "img/imgsp/h1.png", "Nike Sports", inventarioBase())
                );

                productoRepository.saveAll(zapatillas);
                System.out.println("¡Zapatillas precargadas con éxito!");
            }



            // ==========================================
            // PRECARGA DE BLOGS
            // ==========================================
            if (blogsRepository.count() == 0) {
                System.out.println("Iniciando la precarga de blogs en la base de datos H2...");

                List<Blogs> posts = List.of(
                        new Blogs(null,
                                "La historia de las Air Jordan 1",
                                "Descubre cómo un par de zapatillas cambió el mundo del baloncesto.",
                                "En 1985, Nike y Michael Jordan se unieron para crear una de las siluetas más icónicas de la historia. A pesar de las multas de la NBA por romper el código de vestimenta, las Jordan 1 se convirtieron en un fenómeno cultural que perdura hasta el día de hoy.",
                                "https://static.nike.com/a/images/f_auto,cs_srgb/w_1920,c_limit/89c121fc-3d07-4de0-aef6-bcc9c2764a2c/air-jordan-1-2022-lost-and-found-chicago-la-inspiraci%C3%B3n-detr%C3%A1s-del-dise%C3%B1o.jpg"),

                        new Blogs(null,
                                "Cómo cuidar tus sneakers",
                                "Tips y trucos para mantener tus zapatillas como nuevas.",
                                "Mantener tus zapatillas limpias es fundamental para que duren más tiempo. Recuerda usar cepillos de cerdas suaves, productos de limpieza específicos para cada material (cuero, gamuza, tela) y nunca, jamás, meterlas a la lavadora o secadora.",
                                "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80"),

                        new Blogs(null,
                                "Lanzamientos más esperados de este año",
                                "El calendario definitivo para los amantes del streetwear.",
                                "Este año promete colaboraciones increíbles. Desde nuevas ediciones de Travis Scott hasta los rediseños clásicos de Nike Dunk y Yeezy. Mantente atento a nuestras redes para las fechas exactas de lanzamiento en nuestra tienda.",
                                "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80")
                );

                blogsRepository.saveAll(posts);
                System.out.println("¡Blogs precargados con éxito!");
            }
        };
    }
}