package com.GestionSNKR.SnearksSource.service;

import com.GestionSNKR.SnearksSource.model.Carrito;
import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.model.ItemCarrito;
import com.GestionSNKR.SnearksSource.model.Producto;
import com.GestionSNKR.SnearksSource.repository.CarritoRepository;
import com.GestionSNKR.SnearksSource.repository.ClienteRepository;
import com.GestionSNKR.SnearksSource.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Objects;

/**
 * Reglas de negocio del carrito:
 *  - La cantidad debe ser mayor a 0.
 *  - No se puede pedir más unidades que el stock disponible de esa talla
 *    (la misma regla que se vuelve a validar en el checkout).
 *  - El total se recalcula en cada cambio.
 */
@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;

    public CarritoService(CarritoRepository carritoRepository,
                          ClienteRepository clienteRepository,
                          ProductoRepository productoRepository) {
        this.carritoRepository = carritoRepository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public Carrito obtenerCarrito(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado."));

        return carritoRepository.findByClienteId(clienteId)
                .orElseGet(() -> carritoRepository.save(carritoNuevo(cliente)));
    }

    @Transactional
    public Carrito agregarProducto(Long clienteId, Long productoId, Integer cantidad, String talla) {
        validarDatos(productoId, cantidad);

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado."));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));

        String tallaFinal = normalizarTalla(talla);

        Carrito carrito = carritoRepository.findByClienteId(clienteId)
                .orElseGet(() -> carritoNuevo(cliente));

        ItemCarrito itemExistente = buscarItem(carrito, productoId, tallaFinal);

        // Lo que ya tenía en el carrito + lo nuevo no puede superar el stock
        int cantidadTotal = cantidad + (itemExistente != null ? itemExistente.getCantidad() : 0);
        BoletaService.validarStock(producto, tallaFinal, cantidadTotal);

        if (itemExistente != null) {
            itemExistente.setCantidad(cantidadTotal);
        } else {
            ItemCarrito item = new ItemCarrito();
            item.setId(System.currentTimeMillis());
            item.setProductoId(producto.getId());
            item.setNombreProducto(producto.getNombreModelo());
            item.setCantidad(cantidad);
            item.setPrecioUnitario(producto.getPrecio() != null ? producto.getPrecio().doubleValue() : 0.0);
            item.setTalla(tallaFinal);
            carrito.getItems().add(item);
        }

        return guardar(carrito);
    }

    @Transactional
    public Carrito actualizarCantidad(Long clienteId, Long productoId, Integer cantidad, String talla) {
        validarDatos(productoId, cantidad);

        Carrito carrito = obtenerCarrito(clienteId);
        String tallaFinal = normalizarTalla(talla);

        ItemCarrito item = buscarItem(carrito, productoId, tallaFinal);
        if (item == null) {
            throw new IllegalArgumentException("Producto no encontrado en el carrito.");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));

        // Al presionar "+" en el carrito tampoco se puede superar el stock
        BoletaService.validarStock(producto, tallaFinal, cantidad);

        item.setCantidad(cantidad);
        return guardar(carrito);
    }

    @Transactional
    public Carrito eliminarProducto(Long clienteId, Long productoId, String talla) {
        if (productoId == null) {
            throw new IllegalArgumentException("Debe indicar el producto.");
        }

        Carrito carrito = obtenerCarrito(clienteId);
        String tallaFinal = normalizarTalla(talla);

        carrito.getItems().removeIf(item ->
                Objects.equals(item.getProductoId(), productoId)
                        && Objects.equals(item.getTalla(), tallaFinal));

        return guardar(carrito);
    }

    @Transactional
    public Carrito vaciarCarrito(Long clienteId) {
        Carrito carrito = obtenerCarrito(clienteId);
        carrito.getItems().clear();
        return guardar(carrito);
    }

    // ---------- Apoyo ----------

    private static void validarDatos(Long productoId, Integer cantidad) {
        if (productoId == null) {
            throw new IllegalArgumentException("Debe indicar el producto.");
        }
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0.");
        }
    }

    private static String normalizarTalla(String talla) {
        return talla == null || talla.isBlank() ? "única" : talla.trim();
    }

    private static ItemCarrito buscarItem(Carrito carrito, Long productoId, String talla) {
        return carrito.getItems().stream()
                .filter(i -> Objects.equals(i.getProductoId(), productoId)
                        && Objects.equals(i.getTalla(), talla))
                .findFirst()
                .orElse(null);
    }

    private Carrito carritoNuevo(Cliente cliente) {
        Carrito carrito = new Carrito();
        carrito.setCliente(cliente);
        carrito.setItems(new ArrayList<>());
        carrito.setEstado("ABIERTO");
        carrito.setImpuestos(0.0);
        carrito.setFechaCreacion(LocalDateTime.now());
        carrito.setFechaUltimaModificacion(LocalDateTime.now());
        carrito.calcularTotal();
        return carrito;
    }

    private Carrito guardar(Carrito carrito) {
        carrito.setFechaUltimaModificacion(LocalDateTime.now());
        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }
}