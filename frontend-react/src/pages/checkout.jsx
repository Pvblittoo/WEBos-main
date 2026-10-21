
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/checkout.css";

const API = "http://localhost:8080";

const formatoPrecio = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor ?? 0);

export default function Checkout() {
  const navigate = useNavigate();

  const [usuario] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facture_usuario")
      );
    } catch {
      return null;
    }
  });

  const [carrito, setCarrito] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const clienteId = usuario?.id;

  // CARGAR CARRITO DESDE SPRING BOOT
  useEffect(() => {
    if (!clienteId) {
      setCargando(false);
      return;
    }

    const controlador = new AbortController();

    async function cargarCarrito() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(
          `${API}/api/clientes/${clienteId}/carrito`,
          {
            method: "GET",
            credentials: "include",
            signal: controlador.signal,
          }
        );

        if (!respuesta.ok) {
          if (respuesta.status === 401) {
            throw new Error(
              "Tu sesión no está activa. Inicia sesión nuevamente."
            );
          }

          if (respuesta.status === 403) {
            throw new Error(
              "No tienes permisos para consultar este carrito."
            );
          }

          throw new Error(
            `No se pudo cargar el carrito (error ${respuesta.status}).`
          );
        }

        const datos = await respuesta.json();

        if (!controlador.signal.aborted) {
          setCarrito(datos);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al cargar carrito:", err);

          setError(
            err instanceof TypeError
              ? "No se pudo conectar con Spring Boot."
              : err.message
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarCarrito();

    return () => controlador.abort();
  }, [clienteId]);

  // CONFIRMAR COMPRA
  async function confirmarCompra(evento) {
    evento.preventDefault();
    setError("");

    if (!clienteId) {
      setError("Debes iniciar sesión para comprar.");
      return;
    }

    if (!direccion.trim()) {
      setError("Ingresa una dirección de entrega.");
      return;
    }

    if (!carrito?.items?.length) {
      setError("Tu carrito está vacío.");
      return;
    }

    setProcesando(true);

    try {
      const respuesta = await fetch(
        `${API}/api/clientes/${clienteId}/boletas`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metodoPago,
            direccion: direccion.trim(),
          }),
        }
      );

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error(
            "Tu sesión expiró. Inicia sesión nuevamente."
          );
        }

        if (respuesta.status === 403) {
          throw new Error(
            "No tienes permisos para confirmar este pedido."
          );
        }

        const texto = await respuesta.text();

        console.error("Error al confirmar compra:", {
          estado: respuesta.status,
          respuesta: texto,
        });

        throw new Error(
          `No se pudo registrar la compra (error ${respuesta.status}).`
        );
      }

      const boleta = await respuesta.json();

      window.dispatchEvent(
        new Event("carrito-actualizado")
      );

      navigate("/compra-exitosa", {
        replace: true,
        state: { boleta },
      });
    } catch (err) {
      console.error("Error al confirmar compra:", err);

      setError(
        err instanceof TypeError
          ? "No se pudo conectar con Spring Boot."
          : err.message
      );
    } finally {
      setProcesando(false);
    }
  }

  // USUARIO SIN SESIÓN
  if (!clienteId) {
    return (
      <main className="checkout-page">
        <div className="checkout-box">
          <h1>FINALIZAR COMPRA</h1>

          <p>
            Debes iniciar sesión para continuar.
          </p>

          <Link
            to="/login"
            className="checkout-btn"
          >
            INICIAR SESIÓN
          </Link>
        </div>
      </main>
    );
  }

  const items = carrito?.items ?? [];

  return (
    <main className="checkout-page">
      <div className="checkout-box">

        <h1>FINALIZAR COMPRA</h1>

        {/* CARGANDO */}
        {cargando && (
          <p>Cargando pedido...</p>
        )}

        {/* MENSAJES DE ERROR */}
        {error && (
          <p
            className="checkout-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* CARRITO VACÍO */}
        {!cargando && !error && items.length === 0 && (
          <>
            <p>Tu carrito está vacío.</p>

            <Link
              to="/carrito"
              className="checkout-btn"
            >
              VOLVER AL CARRITO
            </Link>
          </>
        )}

        {/* RESUMEN DEL PEDIDO */}
        {!cargando && !error && items.length > 0 && (
          <>
            <h2>RESUMEN DE TU PEDIDO</h2>

            <div className="checkout-productos">
              {items.map((item, indice) => (
                <div
                  className="checkout-producto"
                  key={`${item.productoId}-${item.talla}-${indice}`}
                >
                  <div>
                    <strong>
                      {item.nombreProducto}
                    </strong>

                    <p>
                      Talla {item.talla} · Cantidad{" "}
                      {item.cantidad}
                    </p>
                  </div>

                  <strong>
                    {formatoPrecio(
                      (item.precioUnitario ?? 0) *
                      (item.cantidad ?? 0)
                    )}
                  </strong>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="checkout-total">
              <span>TOTAL</span>

              <strong>
                {formatoPrecio(carrito.total)}
              </strong>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={confirmarCompra}>

              <label htmlFor="direccion">
                DIRECCIÓN DE ENTREGA
              </label>

              <textarea
                id="direccion"
                value={direccion}
                onChange={(e) =>
                  setDireccion(e.target.value)
                }
                placeholder="Calle, número, comuna y región"
                rows="3"
                maxLength={300}
                required
              />

              <label htmlFor="metodoPago">
                MÉTODO DE PAGO
              </label>

              <select
                id="metodoPago"
                value={metodoPago}
                onChange={(e) =>
                  setMetodoPago(e.target.value)
                }
              >
                <option value="TRANSFERENCIA">
                  Transferencia bancaria
                </option>

                <option value="EFECTIVO">
                  Efectivo
                </option>
              </select>

              <p className="checkout-aviso">
                Esta es una confirmación de pedido.
                No se realizará un cobro electrónico.
              </p>

              <button
                type="submit"
                className="checkout-btn"
                disabled={procesando}
              >
                {procesando
                  ? "REGISTRANDO PEDIDO..."
                  : "CONFIRMAR PEDIDO"}
              </button>
            </form>

            <Link
              to="/carrito"
              className="checkout-volver"
            >
              ← VOLVER AL CARRITO
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
