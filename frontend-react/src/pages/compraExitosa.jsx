
import { Link, useLocation } from "react-router-dom";
import "../styles/checkout.css";

export default function CompraExitosa() {
  const { state } = useLocation();
  const boleta = state?.boleta;

  return (
    <main className="checkout-page">
      <div className="checkout-box checkout-exito">
        {boleta ? (
          <>
            <div className="checkout-icono">✓</div>

            <h1>¡PEDIDO REGISTRADO!</h1>

            <p>
              Tu pedido fue registrado correctamente
              en Facture Sneakers.
            </p>

            <h2>BOLETA #{boleta.id}</h2>

            <p>
              Estado: {boleta.estado || "CREADA"}
            </p>

            <p>
              Total:{" "}
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0,
              }).format(boleta.total ?? 0)}
            </p>

            <p>
              Recuerda que registrar el pedido
              no significa que el pago esté realizado.
            </p>
          </>
        ) : (
          <>
            <h1>CONFIRMACIÓN DE PEDIDO</h1>
            <p>
              No hay una confirmación reciente
              para mostrar.
            </p>
          </>
        )}

        <Link to="/" className="checkout-btn">
          VOLVER AL INICIO
        </Link>
      </div>
    </main>
  );
}
