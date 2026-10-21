
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/adminProducto.css";

const API = "http://localhost:8080/api/productos";

const TALLAS = [
  "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46",
];

const formularioInicial = () => ({
  nombreModelo: "",
  precio: "",
  descripcion: "",
  linkImagen: "",
  tipoCategoria: "Nike Urban",
  tallasDisponibles: {},
});

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarProductos() {
    setCargando(true);

    try {
      const respuesta = await fetch(API, {
        credentials: "include",
      });

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron cargar los productos (${respuesta.status}).`
        );
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("El servidor no devolvió una lista.");
      }

      setProductos(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function cambiarCampo(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function cambiarTalla(talla, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      tallasDisponibles: {
        ...anterior.tallasDisponibles,
        [talla]: valor,
      },
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial());
    setEditandoId(null);
  }

  function editarProducto(producto) {
    setFormulario({
      nombreModelo: producto.nombreModelo ?? "",
      precio: String(producto.precio ?? ""),
      descripcion: producto.descripcion ?? "",
      linkImagen: producto.linkImagen ?? "",
      tipoCategoria: producto.tipoCategoria ?? "Nike Urban",
      tallasDisponibles: {
        ...(producto.tallasDisponibles ?? {}),
      },
    });

    setEditandoId(producto.id);
    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarProducto(e) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const precio = Number(formulario.precio);

    if (!Number.isInteger(precio) || precio <= 0) {
      setError("El precio debe ser un número entero mayor que cero.");
      return;
    }

    const stock = {};

    for (const [talla, cantidad] of Object.entries(
      formulario.tallasDisponibles
    )) {
      if (cantidad === "") continue;

      const numero = Number(cantidad);

      if (!Number.isInteger(numero) || numero < 0) {
        setError(`Revisa el stock de la talla ${talla}.`);
        return;
      }

      stock[talla] = numero;
    }

    const datos = {
      nombreModelo: formulario.nombreModelo.trim(),
      precio,
      descripcion: formulario.descripcion.trim(),
      linkImagen: formulario.linkImagen.trim(),
      tipoCategoria: formulario.tipoCategoria,
      tallasDisponibles: stock,
    };

    const editando = editandoId !== null;

    try {
      setGuardando(true);

      const respuesta = await fetch(
        editando ? `${API}/${editandoId}` : API,
        {
          method: editando ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      );

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error("Debes iniciar sesión nuevamente.");
        }

        if (respuesta.status === 403) {
          throw new Error(
            "No tienes permiso de administrador para guardar productos."
          );
        }

        throw new Error(
          `Error al guardar el producto (${respuesta.status}).`
        );
      }

      limpiarFormulario();
      await cargarProductos();

      setMensaje(
        editando
          ? "¡Producto actualizado correctamente!"
          : "¡Producto agregado correctamente!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(producto) {
    const confirmado = window.confirm(
      `¿Quieres eliminar "${producto.nombreModelo}"? Esta acción no se puede deshacer.`
    );

    if (!confirmado) return;

    setError("");
    setMensaje("");

    try {
      setEliminandoId(producto.id);

      const respuesta = await fetch(
        `${API}/${producto.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!respuesta.ok) {
        if (respuesta.status === 403) {
          throw new Error(
            "No tienes permiso para eliminar productos."
          );
        }

        throw new Error(
          `No se pudo eliminar el producto (${respuesta.status}).`
        );
      }

      if (editandoId === producto.id) {
        limpiarFormulario();
      }

      await cargarProductos();
      setMensaje("¡Producto eliminado correctamente!");
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <main className="admin-productos">
      <header className="admin-productos-header">
        <p>FACTURE SNEAKERS / ADMIN</p>

        <h1>
          GESTIÓN DE <span>PRODUCTOS</span>
        </h1>

        <p>
          Administra las zapatillas, los precios y el stock
          de tu tienda.
        </p>

        <Link
          to="/admin"
          style={{
            display: "inline-block",
            marginTop: "25px",
            marginBottom: "10px",
            padding: "12px 22px",
            border: "1px solid #ff1744",
            borderRadius: "8px",
            color: "#ff1744",
            textDecoration: "none",
            fontWeight: "bold",
            backgroundColor: "transparent",
          }}
        >
          ← VOLVER AL PANEL
        </Link>
      </header>

      <section className="admin-productos-panel">
        <h2>
          {editandoId !== null
            ? "EDITAR PRODUCTO"
            : "AGREGAR NUEVO PRODUCTO"}
        </h2>

        <form onSubmit={guardarProducto}>
          <div className="admin-productos-campos">
            <label>
              Nombre de la zapatilla
              <input
                type="text"
                name="nombreModelo"
                value={formulario.nombreModelo}
                onChange={cambiarCampo}
                placeholder="Ej: Air Jordan 1 Chicago"
                required
              />
            </label>

            <label>
              Precio (CLP)
              <input
                type="number"
                name="precio"
                min="1"
                step="1"
                value={formulario.precio}
                onChange={cambiarCampo}
                placeholder="Ej: 129990"
                required
              />
            </label>

            <label>
              Categoría
              <select
                name="tipoCategoria"
                value={formulario.tipoCategoria}
                onChange={cambiarCampo}
              >
                <option value="Nike Urban">Nike Urban</option>
                <option value="Nike Sports">Nike Sports</option>
                <option value="jordan">Jordan</option>
              </select>
            </label>

            <label>
              URL de la imagen
              <input
                type="text"
                name="linkImagen"
                value={formulario.linkImagen}
                onChange={cambiarCampo}
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="admin-productos-descripcion">
            Descripción
            <textarea
              name="descripcion"
              rows="4"
              value={formulario.descripcion}
              onChange={cambiarCampo}
              placeholder="Describe el modelo de zapatilla..."
            />
          </label>

          <h3>STOCK POR TALLA</h3>

          <div className="admin-productos-tallas">
            {TALLAS.map((talla) => (
              <label key={talla}>
                Talla {talla}
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={
                    formulario.tallasDisponibles[talla] ?? ""
                  }
                  onChange={(e) =>
                    cambiarTalla(talla, e.target.value)
                  }
                />
              </label>
            ))}
          </div>

          <div className="admin-productos-acciones">
            <button
              type="submit"
              disabled={guardando}
            >
              {guardando
                ? "GUARDANDO..."
                : editandoId !== null
                  ? "GUARDAR CAMBIOS"
                  : "AGREGAR PRODUCTO"}
            </button>

            {editandoId !== null && (
              <button
                type="button"
                className="admin-productos-cancelar"
                onClick={limpiarFormulario}
              >
                CANCELAR EDICIÓN
              </button>
            )}
          </div>
        </form>

        {mensaje && (
          <p className="admin-productos-exito" role="status">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="admin-productos-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="admin-productos-panel">
        <h2>
          PRODUCTOS REGISTRADOS ({productos.length})
        </h2>

        {cargando ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (
          <div className="admin-productos-lista">
            {productos.map((producto) => {
              const stockTotal = Object.values(
                producto.tallasDisponibles ?? {}
              ).reduce(
                (total, cantidad) =>
                  total + Number(cantidad || 0),
                0
              );

              return (
                <article
                  key={producto.id}
                  className="admin-productos-item"
                >
                  {producto.linkImagen ? (
                    <img
                      src={producto.linkImagen}
                      alt={producto.nombreModelo}
                    />
                  ) : (
                    <div className="admin-productos-sin-imagen">
                      SIN IMAGEN
                    </div>
                  )}

                  <div className="admin-productos-detalle">
                    <h3>{producto.nombreModelo}</h3>

                    <p>{producto.tipoCategoria}</p>

                    <strong>
                      $
                      {Number(
                        producto.precio ?? 0
                      ).toLocaleString("es-CL")}
                    </strong>

                    <p>Stock total: {stockTotal}</p>
                  </div>

                  <div className="admin-productos-botones">
                    <button
                      type="button"
                      onClick={() => editarProducto(producto)}
                    >
                      EDITAR
                    </button>

                    <button
                      type="button"
                      className="admin-productos-eliminar"
                      disabled={eliminandoId === producto.id}
                      onClick={() => eliminarProducto(producto)}
                    >
                      {eliminandoId === producto.id
                        ? "ELIMINANDO..."
                        : "ELIMINAR"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
