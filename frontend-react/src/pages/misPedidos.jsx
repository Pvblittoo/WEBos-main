
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/misPedidos.css";

const API = "http://localhost:8080";

// FORMATO DE PRECIOS EN PESOS CHILENOS
const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor ?? 0);

// FORMATO DE FECHAS
function formatoFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return fechaConvertida.toLocaleString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// PÁGINA MIS PEDIDOS
export default function MisPedidos() {
  const [usuario] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facture_usuario")
      );
    } catch {
      return null;
    }
  });

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const clienteId = usuario?.id;

  useEffect(() => {
    if (!clienteId) {
      setCargando(false);
      return;
    }

    const controlador = new AbortController();

    async function cargarPedidos() {
      try {
        setCargando(true);
        setError("");

        // OBTENER PEDIDOS DEL CLIENTE
        const respuesta = await fetch(
          `${API}/api/clientes/${clienteId}/boletas`,
          {
            method: "GET",
            credentials: "include",
            signal: controlador.signal,
          }
        );

        // VERIFICAR RESPUESTA DEL SERVIDOR
        if (!respuesta.ok) {
          if (respuesta.status === 401) {
            throw new Error(
              "Tu sesión ha expirado. Inicia sesión nuevamente."
            );
          }

          if (respuesta.status === 403) {
            throw new Error(
              "No tienes permisos para consultar estos pedidos."
            );
          }

          if (respuesta.status === 404) {
            throw new Error(
              "No se encontró la ruta del historial de compras en el servidor."
            );
          }

          throw new Error(
            `No se pudo cargar el historial de compras. Error HTTP ${respuesta.status}.`
          );
        }

        const datos = await respuesta.json();

        // COMPROBAR QUE EL BACKEND DEVUELVA UNA LISTA
        if (!Array.isArray(datos)) {
          throw new Error(
            "El servidor no devolvió una lista válida de pedidos."
          );
        }

        if (!controlador.signal.aborted) {
          const pedidosOrdenados = [...datos].sort(
            (a, b) => Number(b.id) - Number(a.id)
          );

          setPedidos(pedidosOrdenados);
        }
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          !controlador.signal.aborted
        ) {
          console.error(
            "Error al cargar pedidos:",
            err
          );

          setError(
            err instanceof TypeError
              ? "No se pudo conectar con el servidor. Comprueba que Spring Boot esté funcionando."
              : err.message
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarPedidos();

    return () => controlador.abort();
  }, [clienteId]);

  // CLIENTE SIN SESIÓN
  if (!clienteId) {
    return (
      <main className="pedidos-pagina">
        <section className="pedidos-contenedor">
          <h1>MIS PEDIDOS</h1>

          <p>
            Debes iniciar sesión para ver tus compras.
          </p>

          <Link
            to="/login"
            className="pedidos-boton"
          >
            INICIAR SESIÓN
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="pedidos-pagina">
      <section className="pedidos-contenedor">
        <h1>MIS PEDIDOS</h1>

        <p className="pedidos-subtitulo">
          Revisa tu historial de compras en
          Facture Sneakers.
        </p>

        {/* CARGANDO */}
        {cargando && (
          <p>Cargando tus pedidos...</p>
        )}

        {/* MENSAJE DE ERROR */}
        {error && (
          <p
            className="pedidos-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* SIN PEDIDOS */}
        {!cargando &&
          !error &&
          pedidos.length === 0 && (
            <div className="pedidos-vacio">
              <h2>Aún no tienes pedidos</h2>

              <p>
                ¡Explora nuestro catálogo y
                encuentra tus próximas zapatillas!
              </p>

              <Link
                to="/catalogo"
                className="pedidos-boton"
              >
                EXPLORAR ZAPATILLAS
              </Link>
            </div>
          )}

        {/* LISTA DE PEDIDOS */}
        {!cargando &&
          !error &&
          pedidos.map((pedido) => (
            <article
              className="pedido-tarjeta"
              key={pedido.id}
            >
              {/* ENCABEZADO */}
              <div className="pedido-encabezado">
                <div>
                  <h2>
                    BOLETA #{pedido.id}
                  </h2>

                  <p>
                    {formatoFecha(pedido.fecha)}
                  </p>
                </div>

                <span
                  className={`pedido-estado ${
                    pedido.estado === "PAGADA"
                      ? "pagada"
                      : pedido.estado === "ENVIADA"
                      ? "enviada"
                      : "creada"
                  }`}
                >
                  {pedido.estado || "CREADA"}
                </span>
              </div>

              {/* PRODUCTOS */}
              <div className="pedido-productos">
                <h3>PRODUCTOS</h3>

                {(pedido.items ?? []).map(
                  (item, indice) => (
                    <div
                      className="pedido-producto"
                      key={`${item.productoId}-${item.talla}-${indice}`}
                    >
                      <div>
                        <strong>
                          {item.nombreProducto}
                        </strong>

                        <p>
                          Talla:{" "}
                          {item.talla ||
                            "Sin talla"}
                        </p>

                        <p>
                          Cantidad:{" "}
                          {item.cantidad}
                        </p>
                      </div>

                      <strong>
                        {formatoPrecio(
                          item.subtotal ??
                            (item.precioUnitario ??
                              0) *
                              (item.cantidad ??
                                0)
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>

              {/* DETALLES DE COMPRA */}
              <div className="pedido-detalles">
                <p>
                  <strong>
                    Método de pago:
                  </strong>{" "}
                  {pedido.metodoPago ||
                    "No especificado"}
                </p>

                <p>
                  <strong>
                    Dirección:
                  </strong>{" "}
                  {pedido.direccion ||
                    "No especificada"}
                </p>
              </div>

              {/* TOTALES */}
              <div className="pedido-totales">
                <p>
                  Subtotal:
                  <strong>
                    {formatoPrecio(
                      pedido.subtotal
                    )}
                  </strong>
                </p>

                <p>
                  Impuestos:
                  <strong>
                    {formatoPrecio(
                      pedido.impuestos
                    )}
                  </strong>
                </p>

                <div className="pedido-total">
                  <span>TOTAL</span>

                  <strong>
                    {formatoPrecio(
                      pedido.total
                    )}
                  </strong>
                </div>
              </div>
            </article>
          ))}

        {/* VOLVER */}
        <Link
          to="/"
          className="pedidos-volver"
        >
          ← VOLVER AL INICIO
        </Link>
      </section>
    </main>
  );
}
