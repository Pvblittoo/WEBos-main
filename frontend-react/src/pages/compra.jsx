
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/compraReact.css";

const API = "http://localhost:8080";

function Compra() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [producto, setProducto] = useState(null);
  const [talla, setTalla] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [agregado, setAgregado] = useState(false);

  // CARGAR PRODUCTO DESDE SPRING BOOT
  useEffect(() => {
    const controlador = new AbortController();

    async function cargarProducto() {
      if (!id) {
        setError("No se seleccionó ningún producto.");
        setCargando(false);
        return;
      }

      setCargando(true);
      setError("");
      setTalla("");
      setCantidad(1);
      setProducto(null);
      setAgregado(false);
      setMensaje("");

      try {
        const respuesta = await fetch(
          `${API}/api/productos/${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include",
            signal: controlador.signal,
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            `No se pudo obtener el producto (${respuesta.status}).`
          );
        }

        const datos = await respuesta.json();

        setProducto(datos);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al cargar producto:", err);

          setError(
            "No se pudo cargar el producto. Revisa Spring Boot."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarProducto();

    return () => controlador.abort();
  }, [id]);

  // TALLAS DISPONIBLES
  const tallas = Object.entries(
    producto?.tallasDisponibles || {}
  ).sort(([a], [b]) => Number(a) - Number(b));

  // STOCK DE LA TALLA SELECCIONADA
  const stockSeleccionado = Number(
    producto?.tallasDisponibles?.[talla] || 0
  );

  // AGREGAR PRODUCTO AL CARRITO
  async function agregarAlCarrito(evento) {
    evento.preventDefault();

    setMensaje("");
    setAgregado(false);

    // VALIDAR PRODUCTO Y TALLA
    if (!producto || !talla) {
      setMensaje(
        "Selecciona una talla antes de continuar."
      );
      return;
    }

    // VALIDAR CANTIDAD
    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > stockSeleccionado
    ) {
      setMensaje(
        "La cantidad supera el stock disponible."
      );
      return;
    }

    // OBTENER USUARIO
    let usuario = null;

    try {
      usuario = JSON.parse(
        sessionStorage.getItem("facture_usuario")
      );
    } catch {
      usuario = null;
    }

    // VERIFICAR INICIO DE SESIÓN
    if (!usuario?.id) {
      setMensaje(
        "Debes iniciar sesión antes de agregar productos al carrito."
      );
      return;
    }

    setProcesando(true);

    try {
      // PETICIÓN AL BACKEND
      const respuesta = await fetch(
        `${API}/api/clientes/${usuario.id}/carrito/items`,
        {
          method: "POST",

          // IMPORTANTE:
          // ENVÍA LA COOKIE DE SESIÓN A SPRING BOOT
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            productoId: producto.id,
            cantidad: cantidad,
            talla: talla,
          }),
        }
      );

      // COMPROBAR RESPUESTA
      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error(
            "Tu sesión no está activa. Inicia sesión nuevamente."
          );
        }

        if (respuesta.status === 403) {
          throw new Error(
            "El servidor rechazó la operación. Revisa los permisos de tu cuenta."
          );
        }

        const texto = await respuesta.text();

        console.error(
          "Error al agregar al carrito:",
          {
            estado: respuesta.status,
            respuesta: texto,
          }
        );

        throw new Error(
          `No se pudo agregar el producto al carrito (error ${respuesta.status}).`
        );
      }

      // PRODUCTO AGREGADO CORRECTAMENTE
      setAgregado(true);

      setMensaje(
        "¡Producto agregado al carrito correctamente!"
      );

      // ACTUALIZAR CONTADOR DEL CARRITO
      window.dispatchEvent(
        new Event("carrito-actualizado")
      );

    } catch (err) {
      console.error(
        "Error al agregar al carrito:",
        err
      );

      if (err instanceof TypeError) {
        setMensaje(
          "No se pudo conectar con Spring Boot. Revisa que esté encendido."
        );
      } else {
        setMensaje(err.message);
      }

    } finally {
      setProcesando(false);
    }
  }

  return (
    <main className="compra-page">
      <div className="checkout-container">

        <h2>FINALIZAR PEDIDO</h2>

        {/* CARGANDO */}
        {cargando && (
          <p>Cargando tallas disponibles...</p>
        )}

        {/* ERROR AL CARGAR */}
        {error && (
          <p className="compra-error">
            {error}
          </p>
        )}

        {/* PRODUCTO */}
        {!cargando && !error && producto && (
          <>
            <div className="compra-producto">
              <h3>
                {producto.nombreModelo}
              </h3>

              <p>
                $
                {Number(
                  producto.precio
                ).toLocaleString("es-CL")}
              </p>
            </div>

            {/* FORMULARIO DE COMPRA */}
            <form
              className="order-form"
              onSubmit={agregarAlCarrito}
            >

              {/* SELECCIÓN DE TALLA */}
              <div className="form-group">
                <p className="section-title">
                  SELECCIONA TU TALLA:
                </p>

                <div
                  className="size-picker"
                  aria-live="polite"
                >
                  {tallas.length === 0 && (
                    <p>
                      No hay tallas disponibles.
                    </p>
                  )}

                  {tallas.map(([numero, stock]) => {
                    const disponible =
                      Number(stock) > 0;

                    return (
                      <button
                        key={numero}
                        type="button"
                        className={
                          talla === numero
                            ? "size-option selected"
                            : "size-option"
                        }
                        disabled={
                          !disponible || procesando
                        }
                        onClick={() => {
                          setTalla(numero);
                          setCantidad(1);
                          setMensaje("");
                          setAgregado(false);
                        }}
                        aria-pressed={
                          talla === numero
                        }
                        title={
                          disponible
                            ? `Stock: ${stock}`
                            : "Sin stock"
                        }
                      >
                        {numero}
                      </button>
                    );
                  })}
                </div>

                {talla && (
                  <p className="stock-info">
                    Stock disponible para talla{" "}
                    {talla}:{" "}
                    {stockSeleccionado}
                  </p>
                )}
              </div>

              {/* CANTIDAD */}
              <div className="form-group">
                <label htmlFor="cantidad">
                  CANTIDAD:
                </label>

                <input
                  type="number"
                  id="cantidad"
                  min="1"
                  max={
                    talla
                      ? stockSeleccionado
                      : undefined
                  }
                  step="1"
                  value={cantidad}
                  onChange={(evento) =>
                    setCantidad(
                      Number(
                        evento.target.value
                      )
                    )
                  }
                  disabled={procesando}
                  required
                />
              </div>

              {/* BOTÓN AGREGAR */}
              <button
                type="submit"
                className="btn-buy"
                disabled={
                  tallas.length === 0 ||
                  procesando
                }
              >
                {procesando
                  ? "AGREGANDO..."
                  : "AGREGAR AL CARRITO"}
              </button>
            </form>

            {/* MENSAJE DE RESULTADO */}
            {mensaje && (
              <p
                className="compra-mensaje"
                role="status"
                style={{
                  color: agregado
                    ? "#00e676"
                    : "#ff4444",
                }}
              >
                {mensaje}
              </p>
            )}

            {/* VER CARRITO */}
            {agregado && (
              <div
                className="compra-volver"
                style={{
                  marginTop: "20px",
                }}
              >
                <Link
                  to="/carrito"
                  className="btn-buy"
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  VER MI CARRITO 🛒
                </Link>
              </div>
            )}

            {/* VOLVER AL DETALLE */}
            <div className="compra-volver">
              <Link
                to={`/detalle?id=${producto.id}`}
                className="btn-back"
              >
                ← VOLVER ATRÁS
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Compra;
