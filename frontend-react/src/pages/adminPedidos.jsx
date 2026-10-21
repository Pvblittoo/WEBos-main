
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/adminPedidos.css";

const API = "http://localhost:8080/api/admin/boletas";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(null);

  const usuario = JSON.parse(
    sessionStorage.getItem("facture_usuario") || "null"
  );

  useEffect(() => {
    if (usuario?.rol !== "ADMIN") {
      setCargando(false);
      return;
    }

    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(API, {
        credentials: "include",
      });

      if (!respuesta.ok) {
        throw new Error(
          respuesta.status === 401 || respuesta.status === 403
            ? "No tienes autorización. Inicia sesión como administrador."
            : "No se pudieron cargar los pedidos."
        );
      }

      const datos = await respuesta.json();
      setPedidos(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      setGuardando(id);
      setError("");

      const respuesta = await fetch(`${API}/${id}/estado`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado }),
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el estado del pedido.");
      }

      await cargarPedidos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(null);
    }
  }

  function formatoPrecio(valor) {
    return Number(valor || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  }

  function formatoFecha(fecha) {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-CL");
  }

  if (usuario?.rol !== "ADMIN") {
    return (
      <main className="admin-pedidos">
        <h2>Acceso denegado</h2>
        <p>Esta sección es exclusiva para administradores.</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    );
  }

  return (
    <main className="admin-pedidos">
      <div className="pedidos-encabezado">
        <div>
          <span className="pedidos-etiqueta">FACTURE SNEAKERS</span>
          <h1>Gestión de pedidos</h1>
          <p>Administra las compras realizadas por los clientes.</p>
        </div>

        <Link to="/admin" className="pedidos-volver">
          ← Volver al panel
        </Link>
      </div>

      <div className="pedidos-resumen">
        <div className="pedidos-tarjeta">
          <span>Total de pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>

        <div className="pedidos-tarjeta">
          <span>Pedidos creados</span>
          <strong>
            {pedidos.filter((p) => p.estado === "CREADA").length}
          </strong>
        </div>

        <div className="pedidos-tarjeta">
          <span>Pedidos enviados</span>
          <strong>
            {pedidos.filter((p) => p.estado === "ENVIADA").length}
          </strong>
        </div>
      </div>

      {error && <p className="pedidos-error">{error}</p>}

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div className="pedidos-vacio">
          Todavía no hay pedidos registrados.
        </div>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map((pedido) => (
            <article className="pedido-card" key={pedido.id}>
              <div className="pedido-superior">
                <div>
                  <h2>Pedido #{pedido.id}</h2>
                  <span>{formatoFecha(pedido.fecha)}</span>
                </div>

                <span className={`pedido-estado ${pedido.estado}`}>
                  {pedido.estado || "SIN ESTADO"}
                </span>
              </div>

              <div className="pedido-informacion">
                <p>
                  <strong>Cliente:</strong>{" "}
                  {pedido.cliente?.nombre ||
                    pedido.cliente?.email ||
                    "Sin información"}
                </p>

                <p>
                  <strong>Correo:</strong>{" "}
                  {pedido.cliente?.email || "No disponible"}
                </p>

                <p>
                  <strong>Dirección:</strong>{" "}
                  {pedido.direccion || "No indicada"}
                </p>

                <p>
                  <strong>Método de pago:</strong>{" "}
                  {pedido.metodoPago || "No indicado"}
                </p>
              </div>

              <h3>Productos comprados</h3>

              <div className="pedido-productos">
                {(pedido.items || []).map((item, index) => (
                  <div className="pedido-producto" key={index}>
                    <span>
                      {item.nombreProducto} — Talla {item.talla}
                      {" "}× {item.cantidad}
                    </span>

                    <strong>
                      {formatoPrecio(item.subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="pedido-total">
                <span>Total</span>
                <strong>{formatoPrecio(pedido.total)}</strong>
              </div>

              <div className="pedido-acciones">
                <label htmlFor={`estado-${pedido.id}`}>
                  Cambiar estado:
                </label>

                <select
                  id={`estado-${pedido.id}`}
                  value={pedido.estado || "CREADA"}
                  disabled={guardando === pedido.id}
                  onChange={(e) =>
                    cambiarEstado(pedido.id, e.target.value)
                  }
                >
                  <option value="CREADA">Creada</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="ENVIADA">Enviada</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
