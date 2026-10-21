
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/miPerfil.css";

const API = "http://localhost:8080";

export default function MiPerfil() {
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      try {
        const respuesta = await fetch(
          `${API}/api/clientes/me`,
          {
            credentials: "include",
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            "No se pudieron cargar los datos del perfil."
          );
        }

        const datos = await respuesta.json();

        if (activo) {
          setCliente(datos);
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
    }

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <main className="perfil-pagina">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="perfil-pagina">
        <p className="perfil-error">{error}</p>
        <Link to="/">← VOLVER AL INICIO</Link>
      </main>
    );
  }

  return (
    <main className="perfil-pagina">
      <div className="perfil-contenedor">
        <p className="perfil-etiqueta">
          FACTURE SNEAKERS / MI CUENTA
        </p>

        <h1>
          MI <span>PERFIL</span>
        </h1>

        <p className="perfil-subtitulo">
          Consulta la información de tu cuenta.
        </p>

        <section className="perfil-tarjeta">
          <div className="perfil-encabezado">
            <div className="perfil-avatar">
              👤
            </div>

            <div>
              <h2>
                {cliente?.nombreCompleto || "Cliente"}
              </h2>
              <p>
                {cliente?.rol === "ADMIN"
                  ? "Administrador"
                  : "Cliente"}
              </p>
            </div>
          </div>

          <div className="perfil-datos">
            <div className="perfil-campo">
              <label>Nombre completo</label>
              <p>{cliente?.nombreCompleto || "No disponible"}</p>
            </div>

            <div className="perfil-campo">
              <label>Correo electrónico</label>
              <p>{cliente?.email || "No disponible"}</p>
            </div>

            <div className="perfil-campo">
              <label>Número de cliente</label>
              <p>#{cliente?.id ?? "—"}</p>
            </div>

            <div className="perfil-campo">
              <label>Tipo de cuenta</label>
              <p>
                {cliente?.rol === "ADMIN"
                  ? "Administrador"
                  : "Cliente"}
              </p>
            </div>
          </div>

          <div className="perfil-acciones">
            <Link to="/mis-pedidos">
              📦 MIS COMPRAS
            </Link>

            <Link to="/">
              ← VOLVER AL INICIO
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
