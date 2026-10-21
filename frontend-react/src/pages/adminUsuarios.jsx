
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/adminUsuarios.css";

const API = "http://localhost:8080/api/admin/clientes";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const respuesta = await fetch(API, {
          credentials: "include",
        });

        if (!respuesta.ok) {
          throw new Error(
            respuesta.status === 401 || respuesta.status === 403
              ? "No tienes autorización para consultar los usuarios."
              : "No se pudieron cargar los usuarios."
          );
        }

        const datos = await respuesta.json();
        setUsuarios(Array.isArray(datos) ? datos : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, []);

  const filtrados = usuarios.filter((usuario) => {
    const texto = `${usuario.nombreCompleto || ""} ${
      usuario.email || ""
    } ${usuario.rol || ""}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const administradores = usuarios.filter(
    (usuario) => usuario.rol === "ADMIN"
  ).length;

  return (
    <main className="admin-usuarios">
      <div className="usuarios-encabezado">
        <div>
          <span className="usuarios-etiqueta">
            FACTURE SNEAKERS
          </span>
          <h1>Gestión de usuarios</h1>
          <p>Consulta las cuentas registradas en la tienda.</p>
        </div>

        <Link to="/admin" className="usuarios-volver">
          ← Volver al panel
        </Link>
      </div>

      <div className="usuarios-resumen">
        <div className="usuarios-tarjeta">
          <span>Usuarios registrados</span>
          <strong>{usuarios.length}</strong>
        </div>

        <div className="usuarios-tarjeta">
          <span>Administradores</span>
          <strong>{administradores}</strong>
        </div>

        <div className="usuarios-tarjeta">
          <span>Clientes</span>
          <strong>{usuarios.length - administradores}</strong>
        </div>
      </div>

      <div className="usuarios-buscador">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="usuarios-error">{error}</p>}

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : !error && filtrados.length === 0 ? (
        <div className="usuarios-vacio">
          No se encontraron usuarios.
        </div>
      ) : !error ? (
        <div className="usuarios-tabla-contenedor">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Comuna</th>
                <th>Rol</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td>#{usuario.id}</td>
                  <td>{usuario.nombreCompleto}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.comuna || "No indicada"}</td>
                  <td>
                    <span
                      className={`usuario-rol ${
                        usuario.rol === "ADMIN"
                          ? "rol-admin"
                          : "rol-cliente"
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
