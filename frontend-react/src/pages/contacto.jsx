
import { useState } from "react";
import "../styles/contacto.css";

export default function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    contenido: "",
  });

  const [mensaje, setMensaje] = useState("");

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const enviarFormulario = (e) => {
    e.preventDefault();

    // Por ahora el formulario funciona en React,
    // pero aún no envía datos al backend.
    setMensaje(
      "Formulario validado. El envío de mensajes estará disponible próximamente."
    );
  };

  return (
    <main className="contacto-pagina">
      <section className="contacto-encabezado">
        <p className="contacto-etiqueta">
          FACTURE SNEAKERS
        </p>

        <h1>
          CONTÁCTANOS<span>.</span>
        </h1>

        <p>
          ¿Tienes alguna pregunta sobre nuestros
          productos? Escríbenos a través del
          formulario de contacto.
        </p>
      </section>

      <section className="contacto-contenedor">
        <div className="contacto-informacion">
          <span className="contacto-etiqueta">
            ESTAMOS PARA AYUDARTE
          </span>

          <h2>HABLEMOS DE SNEAKERS</h2>

          <p>
            En Facture Sneakers queremos ofrecerte
            una buena experiencia de compra.
            Si tienes dudas, sugerencias o consultas,
            puedes dejarnos tu mensaje.
          </p>

          <div className="contacto-dato">
            <span>01</span>
            <div>
              <h3>CONSULTAS</h3>
              <p>Preguntas sobre zapatillas y colecciones.</p>
            </div>
          </div>

          <div className="contacto-dato">
            <span>02</span>
            <div>
              <h3>SOPORTE</h3>
              <p>Ayuda relacionada con tus compras.</p>
            </div>
          </div>

          <div className="contacto-dato">
            <span>03</span>
            <div>
              <h3>SUGERENCIAS</h3>
              <p>Nos interesa conocer tu opinión.</p>
            </div>
          </div>
        </div>

        <div className="contacto-tarjeta">
          <h2>FORMULARIO DE CONTACTO</h2>

          <p className="contacto-form-descripcion">
            Completa los siguientes campos.
          </p>

          <form onSubmit={enviarFormulario}>
            <div className="contacto-campo">
              <label htmlFor="nombre">
                NOMBRE COMPLETO
              </label>

              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Tu nombre completo"
                value={formulario.nombre}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="contacto-campo">
              <label htmlFor="correo">
                CORREO ELECTRÓNICO
              </label>

              <input
                type="email"
                id="correo"
                name="correo"
                placeholder="usuario@dominio.com"
                value={formulario.correo}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="contacto-campo">
              <label htmlFor="contenido">
                CONTENIDO
              </label>

              <textarea
                id="contenido"
                name="contenido"
                placeholder="Escribe tu mensaje aquí..."
                rows="6"
                value={formulario.contenido}
                onChange={manejarCambio}
                required
              />
            </div>

            <button
              type="submit"
              className="contacto-boton"
            >
              ENVIAR MENSAJE →
            </button>

            {mensaje && (
              <p className="contacto-aviso" role="status">
                {mensaje}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
