
import { Link } from 'react-router-dom';
import '../styles/accesoReact.css';

function Acceso() {
  return (
    <main className="acceso-page">
      <div className="split-container">

        {/* MITAD IZQUIERDA: INICIAR SESIÓN */}
        <section className="split-side left-side">
          <div className="content-card">

            <h2 className="side-title">
              ¿YA TIENES CUENTA?
            </h2>

            <p className="side-description">
              Ingresa a tu perfil para gestionar tus
              compras y revisar tus pedidos.
            </p>

            <Link
              to="/login"
              className="btn-action btn-red-submit"
            >
              INICIAR SESIÓN
            </Link>

          </div>
        </section>

        {/* MITAD DERECHA: REGISTRARSE */}
        <section className="split-side right-side">
          <div className="content-card">

            <h2 className="side-title">
              ¿ERES NUEVO?
            </h2>

            <p className="side-description">
              Crea una cuenta para disfrutar de la mejor
              experiencia y lanzamientos exclusivos.
            </p>

            <Link
              to="/registro"
              className="btn-action btn-black"
            >
              REGISTRARSE
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Acceso;
