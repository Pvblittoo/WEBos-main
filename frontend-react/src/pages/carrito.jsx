
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/carrito.css";

const API = "http://localhost:8080";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor ?? 0);

export default function Carrito() {
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const usuario = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facture_usuario")
      );
    } catch {
      return null;
    }
  })();

  const clienteId = usuario?.id;

  const baseUrl = `${API}/api/clientes/${clienteId}/carrito`;

  useEffect(() => {
    if (!clienteId) {
      setCargando(false);
      return;
    }

    let activo = true;

    const cargarCarrito = async () => {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(baseUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!respuesta.ok) {
          if (respuesta.status === 401) {
            throw new Error(
              "Tu sesión no está activa. Vuelve a iniciar sesión."
            );
          }

          if (respuesta.status === 403) {
            throw new Error(
              "No tienes permiso para acceder a este carrito."
            );
          }

          throw new Error("No se pudo cargar el carrito.");
        }

        const datos = await respuesta.json();

        if (activo) {
          setCarrito(datos);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarCarrito();

    return () => {
      activo = false;
    };
  }, [clienteId, baseUrl]);

  const ejecutarOperacion = async (url, opciones) => {
    setProcesando(true);
    setMensaje("");
    setError("");

    try {
      const respuesta = await fetch(url, {
        ...opciones,
        credentials: "include",
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error(
            "Tu sesión expiró. Inicia sesión nuevamente."
          );
        }

        if (respuesta.status === 403) {
          throw new Error(
            "No tienes permiso para modificar este carrito."
          );
        }

        const texto = await respuesta.text();

        throw new Error(
          texto || "Error al modificar el carrito."
        );
      }

      const datos = await respuesta.json();

      setCarrito(datos);
      setMensaje("Carrito actualizado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const cambiarCantidad = (item, nuevaCantidad) => {
    if (nuevaCantidad < 1 || procesando) {
      return;
    }

    ejecutarOperacion(
      `${baseUrl}/items/${item.productoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productoId: item.productoId,
          cantidad: nuevaCantidad,
          talla: item.talla,
        }),
      }
    );
  };

  const eliminarProducto = (item) => {
    if (procesando) {
      return;
    }

    const parametros = new URLSearchParams();

    if (item.talla != null) {
      parametros.set("talla", item.talla);
    }

    const query = parametros.toString();

    ejecutarOperacion(
      `${baseUrl}/items/${item.productoId}${
        query ? `?${query}` : ""
      }`,
      {
        method: "DELETE",
      }
    );
  };

  const vaciarCarrito = () => {
    if (procesando) {
      return;
    }

    if (!window.confirm("¿Quieres vaciar todo el carrito?")) {
      return;
    }

    ejecutarOperacion(baseUrl, {
      method: "DELETE",
    });
  };

  if (!clienteId) {
    return (
      <main className="carrito-pagina">
        <section className="carrito-panel">
          <h1>MI CARRITO</h1>

          <p>
            Debes iniciar sesión para ver tu carrito.
          </p>

          <Link to="/login" className="carrito-boton">
            INICIAR SESIÓN
          </Link>
        </section>
      </main>
    );
  }

  const items = carrito?.items ?? [];

  return (
    <main className="carrito-pagina">
      <section className="carrito-panel">
        <h1>MI CARRITO</h1>

        <p className="carrito-subtitulo">
          Tus zapatillas seleccionadas
        </p>

        {cargando && (
          <p>Cargando carrito...</p>
        )}

        {error && (
          <p className="carrito-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="carrito-exito" role="status">
            {mensaje}
          </p>
        )}

        {!cargando && !error && items.length === 0 && (
          <div className="carrito-vacio">
            <h2>Tu carrito está vacío 🛒</h2>

            <p>¡Explora nuestras zapatillas!</p>

            <Link
              to="/#colecciones"
              className="carrito-boton"
            >
              VER PRODUCTOS
            </Link>
          </div>
        )}

        {!cargando && !error && items.length > 0 && (
          <>
            <div className="row g-4">
            <div className="col-12 col-lg-8">
            <div className="carrito-items">
              {items.map((item, indice) => (
                <article
                  className="carrito-item flex-column flex-md-row align-items-stretch align-items-md-center"
                  key={`${item.productoId}-${item.talla}-${indice}`}
                >
                  <div className="carrito-info">
                    <h2>{item.nombreProducto}</h2>

                    <p>
                      Talla: {item.talla || "Sin talla"}
                    </p>

                    <p>
                      Precio unitario:{" "}
                      {formatoPrecio(item.precioUnitario)}
                    </p>

                    <strong>
                      Subtotal:{" "}
                      {formatoPrecio(
                        (item.precioUnitario ?? 0) *
                        (item.cantidad ?? 0)
                      )}
                    </strong>
                  </div>

                  <div className="carrito-acciones align-items-start align-items-md-center">
                    <div className="carrito-cantidad">
                      <button
                        type="button"
                        disabled={
                          procesando ||
                          item.cantidad <= 1
                        }
                        onClick={() =>
                          cambiarCantidad(
                            item,
                            item.cantidad - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.cantidad}</span>

                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() =>
                          cambiarCantidad(
                            item,
                            item.cantidad + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="carrito-eliminar"
                      disabled={procesando}
                      onClick={() =>
                        eliminarProducto(item)
                      }
                    >
                      ELIMINAR
                    </button>
                  </div>
                </article>
              ))}
            </div>
            </div>

            <div className="col-12 col-lg-4">
            <div className="carrito-resumen">
              <h2>RESUMEN DE COMPRA</h2>

              <p>
                Subtotal:
                <strong>
                  {formatoPrecio(carrito.subtotal)}
                </strong>
              </p>

              <p>
                Impuestos:
                <strong>
                  {formatoPrecio(carrito.impuestos)}
                </strong>
              </p>

              <div className="carrito-total">
                <span>TOTAL:</span>

                <strong>
                  {formatoPrecio(carrito.total)}
                </strong>

                <Link
                  to="/checkout"
                  className="carrito-boton"
                >
                  FINALIZAR COMPRA
                </Link>
              </div>

              <button
                type="button"
                className="carrito-vaciar"
                disabled={procesando}
                onClick={vaciarCarrito}
              >
                VACIAR CARRITO
              </button>

              <Link
                to="/#colecciones"
                className="carrito-boton w-100"
              >
                SEGUIR COMPRANDO
              </Link>
            </div>
            </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
