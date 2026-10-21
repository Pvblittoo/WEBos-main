
import { useEffect, useState } from "react";
import "../styles/blogs.css";

const API = "http://localhost:8080";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [blogSeleccionado, setBlogSeleccionado] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarBlogs() {
      try {
        const respuesta = await fetch(`${API}/api/blogs`, {
          signal: controlador.signal,
        });

        if (!respuesta.ok) {
          throw new Error("Error al cargar los blogs");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error("Formato de blogs incorrecto");
        }

        setBlogs(datos);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("No se pudieron cargar los artículos.");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarBlogs();

    return () => controlador.abort();
  }, []);

  useEffect(() => {
    if (!blogSeleccionado) return;

    const cerrarConEscape = (e) => {
      if (e.key === "Escape") {
        setBlogSeleccionado(null);
      }
    };

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [blogSeleccionado]);

  return (
    <main className="blogs-pagina">
      <section className="blogs-encabezado">
        <p className="blogs-etiqueta">FACTURE SNEAKERS</p>

        <h1>
          THE SNEAKER <span>EDITORIAL</span>
        </h1>

        <p className="blogs-descripcion">
          Cultura, lanzamientos y la historia detrás de cada par.
        </p>
      </section>

      <section className="blogs-contenido">
        <div className="blogs-titulo-seccion">
          <span className="blogs-etiqueta">NUESTRO BLOG</span>
          <h2>ÚLTIMOS ARTÍCULOS</h2>
        </div>

        {cargando && (
          <div className="blogs-estado">
            <div className="blogs-spinner"></div>
            <h3>Cargando artículos...</h3>
          </div>
        )}

        {!cargando && error && (
          <div className="blogs-estado blogs-error">
            <h3>Error de conexión</h3>
            <p>{error}</p>
          </div>
        )}

        {!cargando && !error && blogs.length === 0 && (
          <div className="blogs-estado">
            <h3>No hay artículos publicados</h3>
          </div>
        )}

        {!cargando && !error && (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <article
                className="blogs-tarjeta"
                key={blog.id_posteo}
              >
                <div className="blogs-imagen">
                  {blog.link_imagen_post ? (
                    <img
                      src={blog.link_imagen_post}
                      alt={blog.nombre_post}
                      loading="lazy"
                    />
                  ) : (
                    <div className="blogs-sin-imagen">
                      FACTURE <span>SNEAKERS</span>
                    </div>
                  )}
                </div>

                <div className="blogs-info">
                  <span className="blogs-categoria">
                    LATEST DROP
                  </span>

                  <p className="blogs-meta">
                    POST #{blog.id_posteo}
                  </p>

                  <h3>{blog.nombre_post}</h3>

                  <p className="blogs-resumen">
                    {blog.descripcion_post}
                  </p>

                  <button
                    type="button"
                    className="blogs-boton"
                    onClick={() => setBlogSeleccionado(blog)}
                  >
                    LEER ARTÍCULO →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {blogSeleccionado && (
        <div
          className="blogs-modal-fondo"
          onClick={() => setBlogSeleccionado(null)}
        >
          <section
            className="blogs-modal"
            role="dialog"
            aria-modal="true"
            aria-label={blogSeleccionado.nombre_post}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="blogs-modal-cerrar"
              onClick={() => setBlogSeleccionado(null)}
              aria-label="Cerrar artículo"
            >
              ✕
            </button>

            {blogSeleccionado.link_imagen_post && (
              <img
                className="blogs-modal-imagen"
                src={blogSeleccionado.link_imagen_post}
                alt={blogSeleccionado.nombre_post}
              />
            )}

            <div className="blogs-modal-contenido">
              <span className="blogs-etiqueta">
                FACTURE SNEAKERS / EDITORIAL
              </span>

              <h2>{blogSeleccionado.nombre_post}</h2>

              <p className="blogs-modal-descripcion">
                {blogSeleccionado.descripcion_post}
              </p>

              <div className="blogs-modal-separador"></div>

              <p className="blogs-modal-texto">
                {blogSeleccionado.contenido_post ||
                  "Este artículo todavía no tiene contenido."}
              </p>

              <button
                type="button"
                className="blogs-boton"
                onClick={() => setBlogSeleccionado(null)}
              >
                ← VOLVER A LOS ARTÍCULOS
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
