
import React from "react";
import { Link } from "react-router-dom";
import "./../styles/catalogo.css";

const categorias = [
  {
    nombre: "NIKE URBAN",
    descripcion:
      "Estilo urbano para destacar en cada paso.",
    imagen: "/img/logo/urb.jpg",
    ruta: "/nike-urban",
  },
  {
    nombre: "NIKE SPORTS",
    descripcion:
      "Rendimiento, comodidad y diseño deportivo.",
    imagen: "/img/logo/descarga.jpg",
    ruta: "/nike-sports",
  },
  {
    nombre: "JORDAN",
    descripcion:
      "La esencia del básquetbol y la cultura sneaker.",
    imagen: "/img/logo/ljordan.jpg",
    ruta: "/jordan",
  },
];

export default function Catalogo() {
  return (
    <main className="catalogo-general">
      <section className="catalogo-encabezado">
        <p>FACTURE SNEAKERS</p>
        <h1>
          NUESTRO <span>CATÁLOGO</span>
        </h1>
        <p className="catalogo-subtitulo">
          Explora nuestras colecciones y encuentra
          las zapatillas que van con tu estilo.
        </p>
      </section>

      <section className="container">
        <div className="row g-4 justify-content-center">
          {categorias.map((categoria) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={categoria.nombre}
            >
              <article className="card h-100 catalogo-tarjeta">
                <div className="catalogo-imagen">
                  <img
                    className="card-img-top"
                    src={categoria.imagen}
                    alt={categoria.nombre}
                  />
                </div>

                <div className="card-body d-flex flex-column catalogo-info">
                  <h2 className="card-title">
                    {categoria.nombre}
                  </h2>
                  <p className="card-text">
                    {categoria.descripcion}
                  </p>

                  <Link
                    to={categoria.ruta}
                    className="catalogo-enlace mt-auto align-self-start"
                  >
                    VER ZAPATILLAS →
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
