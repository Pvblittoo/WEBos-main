package com.GestionSNKR.SnearksSource.service;

import com.GestionSNKR.SnearksSource.model.Boleta;
import com.GestionSNKR.SnearksSource.model.Carrito;
import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.model.ItemCarrito;
import com.GestionSNKR.SnearksSource.model.Producto;
import com.GestionSNKR.SnearksSource.repository.BoletaRepository;
import com.GestionSNKR.SnearksSource.repository.CarritoRepository;
import com.GestionSNKR.SnearksSource.repository.ClienteRepository;
import com.GestionSNKR.SnearksSource.repository.ProductoRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final CarritoRepository carritoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final JavaMailSender mailSender;

    public BoletaService(BoletaRepository boletaRepository,
                         CarritoRepository carritoRepository,
                         ClienteRepository clienteRepository,
                         ProductoRepository productoRepository,
                         JavaMailSender mailSender) {
        this.boletaRepository = boletaRepository;
        this.carritoRepository = carritoRepository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
        this.mailSender = mailSender;
    }

    /**
     * Convierte el carrito en una boleta.
     *
     * @Transactional: todo ocurre en una sola transacción. Si algún producto
     * no tiene stock suficiente, se lanza una excepción y se revierte TODO:
     * no se crea la boleta, no se descuenta ningún stock y el carrito queda igual.
     */
    @Transactional
    public Boleta crearDesdeCarrito(Long clienteId, String metodoPago, String direccion) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado."));

        Carrito carrito = carritoRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Carrito no encontrado para el cliente."));

        if (carrito.getItems() == null || carrito.getItems().isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío.");
        }

        if (metodoPago == null || metodoPago.isBlank()) {
            throw new IllegalArgumentException("El método de pago es obligatorio.");
        }

        if (direccion == null || direccion.isBlank()) {
            throw new IllegalArgumentException("La dirección es obligatoria.");
        }

        // 1) VALIDAR Y DESCONTAR STOCK POR TALLA
        Map<Long, Producto> productos = new HashMap<>();

        for (ItemCarrito item : carrito.getItems()) {
            Producto producto = productos.computeIfAbsent(item.getProductoId(), id ->
                    productoRepository.findById(id).orElseThrow(() ->
                            new IllegalArgumentException("El producto " + item.getNombreProducto()
                                    + " ya no existe en el catálogo.")));

            validarStock(producto, item.getTalla(), item.getCantidad());

            Map<String, Integer> tallas = producto.getTallasDisponibles();
            if (tallas != null && tallas.containsKey(item.getTalla())) {
                tallas.put(item.getTalla(), tallas.get(item.getTalla()) - item.getCantidad());
            }
        }

        productoRepository.saveAll(productos.values());

        // 2) CREAR LA BOLETA
        Boleta boleta = new Boleta();
        boleta.setCliente(cliente);
        List<ItemCarrito> itemsBoleta = new ArrayList<>();
        carrito.getItems().forEach(item -> itemsBoleta.add(item.copy()));
        boleta.setItems(itemsBoleta);
        boleta.setImpuestos(carrito.getImpuestos());
        boleta.setMetodoPago(metodoPago);
        boleta.setDireccion(direccion);
        boleta.setFecha(LocalDateTime.now());
        boleta.setEstado("CREADA");
        boleta.calcularTotal();

        Boleta guardada = boletaRepository.save(boleta);

        // 3) VACIAR EL CARRITO
        carrito.getItems().clear();
        carrito.calcularTotal();
        carritoRepository.save(carrito);

        // 4) ENVIAR BOLETA POR CORREO (si falla, la compra igual queda registrada)
        if (guardada.getCliente() != null
                && guardada.getCliente().getEmail() != null
                && !guardada.getCliente().getEmail().isBlank()) {
            enviarBoletaPorEmailAsync(guardada);
        }

        return guardada;
    }

    /**
     * Regla de negocio del stock: si el producto tiene tallas registradas,
     * la cantidad pedida no puede superar las unidades disponibles de esa talla.
     * Es pública y estática para que CarritoService use la misma regla.
     */
    public static void validarStock(Producto producto, String talla, int cantidadPedida) {
        Map<String, Integer> tallas = producto.getTallasDisponibles();
        if (tallas == null || tallas.isEmpty()) {
            return; // producto sin control de tallas
        }

        Integer disponible = tallas.get(talla);
        if (disponible == null) {
            throw new IllegalArgumentException(
                    "La talla " + talla + " no está disponible para " + producto.getNombreModelo() + ".");
        }

        if (cantidadPedida > disponible) {
            throw new IllegalArgumentException(
                    "Stock insuficiente para " + producto.getNombreModelo() + " talla " + talla
                            + ". Disponibles: " + disponible + ".");
        }
    }

    @Async
    public void enviarBoletaPorEmailAsync(Boleta boleta) {
        try {
            enviarBoletaPorEmail(boleta);
        } catch (Exception ex) {
            System.err.println("Error enviando boleta por email: " + ex.getMessage());
        }
    }

    private void enviarBoletaPorEmail(Boleta boleta) throws Exception {
        String destino = boleta.getCliente().getEmail();
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setTo(destino);
        helper.setFrom("no-reply@snearks.com");
        helper.setSubject("Tu boleta - Pedido #" + boleta.getId());

        StringBuilder html = new StringBuilder();
        html.append("<h2>Gracias por tu compra</h2>");
        html.append("<p>Boleta #").append(boleta.getId()).append(" - ").append(boleta.getFecha()).append("</p>");
        html.append("<table border='1' cellpadding='6' cellspacing='0'>");
        html.append("<tr><th>Producto</th><th>Talla</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>");
        boleta.getItems().forEach(i -> {
            html.append("<tr>");
            html.append("<td>").append(i.getNombreProducto()).append("</td>");
            html.append("<td>").append(i.getTalla()).append("</td>");
            html.append("<td>").append(i.getCantidad()).append("</td>");
            html.append("<td>").append(String.format("%.2f", i.getPrecioUnitario())).append("</td>");
            html.append("<td>").append(String.format("%.2f", i.getSubtotal())).append("</td>");
            html.append("</tr>");
        });
        html.append("</table>");
        html.append("<p><b>Total: </b>").append(String.format("%.2f", boleta.getTotal())).append("</p>");

        helper.setText(html.toString(), true);
        mailSender.send(msg);
    }

    public List<Boleta> listarPorCliente(Long clienteId) {
        return boletaRepository.findByClienteId(clienteId);
    }

    public Boleta obtener(Long clienteId, Long boletaId) {
        return boletaRepository.findById(boletaId)
                .filter(b -> b.getCliente() != null && b.getCliente().getId().equals(clienteId))
                .orElseThrow(() -> new IllegalArgumentException("Boleta no encontrada para ese cliente."));
    }

    public List<Boleta> listarTodas() {
        return boletaRepository.findAll();
    }

    @Transactional
    public Boleta actualizarEstado(Long boletaId, String nuevoEstado) {
        Boleta boleta = boletaRepository.findById(boletaId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Pedido no encontrado."));

        if (nuevoEstado == null) {
            throw new IllegalArgumentException("El estado es obligatorio.");
        }

        String estado = nuevoEstado.trim().toUpperCase();

        if (!List.of("CREADA", "PAGADA", "ENVIADA").contains(estado)) {
            throw new IllegalArgumentException("Estado no válido.");
        }

        boleta.setEstado(estado);

        return boletaRepository.save(boleta);
    }
}