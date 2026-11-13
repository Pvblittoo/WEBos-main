import { Link, Navigate, useLocation } from "react-router-dom";

/**
 * Guardia de rutas del frontend.
 *
 *  - Sin sesión: redirige a /login y recuerda la página que se quería abrir.
 *  - Con sesión pero sin el rol requerido: muestra "Acceso denegado".
 *  - Con sesión y rol correcto: muestra la página.
 *
 * Importante: esto mejora la experiencia de usuario, pero la seguridad real
 * está en el backend, que valida el JWT y el rol en cada petición.
 */
export default function RutaProtegida({ usuario, rol, children }) {
  const location = useLocation();

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (rol && usuario.rol !== rol) {
    return <AccesoDenegado />;
  }

  return children;
}

export function AccesoDenegado() {
  return (
    <main className="container py-5 text-white" style={{ minHeight: "70vh" }}>
      <h2 style={{ color: "#ff1744" }}>ACCESO DENEGADO</h2>
      <p>No tienes permisos para entrar a esta página.</p>
      <Link to="/" style={{ color: "#ff1744" }}>
        VOLVER AL INICIO
      </Link>
    </main>
  );
}