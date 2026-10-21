
import React from "react";
import { Link } from "react-router-dom";
import "../styles/nosotros.css";

const equipo = [
  {
    nombre: "Francisca Aguirre",
    cargo: "Desarrolladora Backend",
    iniciales: "FA",
  },
  {
    nombre: "Adriano Flores",
    cargo: "Desarrollador Frontend",
    iniciales: "AF",
  },
  {
    nombre: "Pablo Morales",
    cargo: "Desarrollador Web",
    iniciales: "PM",
  },
];

export default function Nosotros() {
  return (
    <main className="pagina-nosotros">
      <section className="nosotros-portada">
        <p className="nosotros-etiqueta">FACTURE SNEAKERS</p>

        <h1>
          SOBRE <span>NOSOTROS</span>
        </h1>

        <p className="nosotros-descripcion">
          Somos una tienda dedicada a ofrecer las mejores
          marcas, modelos exclusivos y tendencias urbanas,
          del mundo deportivo y de la línea Jordan.
          Nuestra pasión por la calidad y el diseño nos
          mueve a brindar una experiencia única en cada compra.
        </p>

        <Link to="/catalogo" className="nosotros-boton">
          EXPLORAR CATÁLOGO →
        </Link>
      </section>

      <section className="nosotros-contenido">
        <div className="nosotros-bloque">
          <span className="nosotros-numero">01 / NUESTRA MISIÓN</span>
          <h2>NUESTRA MISIÓN</h2>
          <p>
            Conectar a nuestros clientes con productos
            auténticos, garantizando un servicio de
            excelencia, rapidez en las entregas y
            atención personalizada en todo momento.
          </p>
        </div>

        <div className="nosotros-bloque">
          <span className="nosotros-numero">02 / NUESTRA VISIÓN</span>
          <h2>NUESTRA VISIÓN</h2>
          <p>
            Ser referentes en el sector del calzado,
            reconocidos por nuestra innovación,
            variedad de catálogo y compromiso
            con la comunidad.
          </p>
        </div>
      </section>

      <section className="nosotros-equipo">
        <p className="nosotros-etiqueta">
          LAS PERSONAS DETRÁS DEL PROYECTO
        </p>

        <h2>
          CONOCE A LOS <span>CREADORES</span>
        </h2>

        <p className="nosotros-equipo-descripcion">
          Somos un equipo de tres desarrolladores
          que creó Facture Sneakers con el objetivo
          de acercar el mundo de las zapatillas
          más vendidas mediante una plataforma
          moderna y organizada por categorías.
        </p>

        <div className="nosotros-equipo-grid">
          {equipo.map((integrante) => (
            <article
              className="nosotros-integrante"
              key={integrante.nombre}
            >
              <div className="nosotros-avatar">
                {integrante.iniciales}
              </div>

              <h3>{integrante.nombre}</h3>
              <p>{integrante.cargo}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="nosotros-cierre">
        <h2>ENCUENTRA TU PRÓXIMO PAR</h2>
        <p>
          Explora nuestro catálogo y descubre
          el estilo que mejor te representa.
        </p>

        <Link to="/catalogo" className="nosotros-boton">
          VER PRODUCTOS →
        </Link>
      </section>
    </main>
  );
}
