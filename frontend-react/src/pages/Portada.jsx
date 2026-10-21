
import { Link } from "react-router-dom";
import Dragon from "../components/Dragon.jsx";
import "../styles/portada.css";

function Portada({ usuario }) {
  const irAColecciones = (e) => {
    const colecciones = document.getElementById(
      "colecciones"
    );

    if (colecciones) {
      e.preventDefault();

      colecciones.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pagina-portada">

      {/* DRAGÓN INTERACTIVO ORIGINAL */}
      <Dragon />

      {/* PORTADA PRINCIPAL */}
      <main className="hero-overlay">
        <div className="hero-content">

          {/* TÍTULO */}
          <h1 className="brand-title">
            FACTURE SNEAKERS
          </h1>

          {/* DESCRIPCIÓN */}
          <p className="brand-description">
            Tu tienda urbana de confianza. Descubre las
            zapatillas más exclusivas, lanzamientos
            limitados y el mejor estilo streetwear en
            un solo lugar.
          </p>

          {/* BOTONES */}
          <div className="button-group">

            {/* VER PRODUCTOS */}
            <a
              href="/#colecciones"
              className="btn btn-red"
              onClick={irAColecciones}
            >
              Ver Productos
            </a>

            {/* BOTÓN DINÁMICO */}
            {usuario ? (
              <Link
                to="/carrito"
                className="btn btn-red-outline"
              >
                Ver Mi Carrito
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn btn-red-outline"
              >
                Iniciar Sesión
              </Link>
            )}

          </div>
        </div>
      </main>

    </section>
  );
}

export default Portada;
