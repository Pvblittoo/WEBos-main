
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import WebGLBackground from '../components/webGLBackground.jsx';
import '../styles/nikeUrban.css';

function Jordan() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarProductos() {
      try {
        const respuesta = await fetch(
          'http://localhost:8080/api/productos/categoria/jordan',
          { signal: controlador.signal }
        );

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los productos Jordan');
        }

        const datos = await respuesta.json();

        setProductos(datos);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al cargar Jordan:', err);
          setError(
            'No se pudieron cargar los productos. Revisa que el backend esté encendido.'
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarProductos();

    return () => controlador.abort();
  }, []);

  const imagenesCarrusel = [
    're1.png',
    're3.png',
    're5.png',
    're11.png',
    're12.png',
    're13.png',
    're4.png',
    'tra1.png',
  ];

  function obtenerImagen(ruta) {
    if (!ruta) return '';

    if (/^https?:\/\//i.test(ruta)) {
      return ruta;
    }

    return `/${ruta.replace(/^\/+/, '')}`;
  }

  return (
    <main className="nike-urban-page">

      {/* Fondo animado */}
      <WebGLBackground />

      {/* Título principal */}
      <div className="titulo-tienda">
        <h1>SNEAKERS STORE</h1>
      </div>

      {/* Carrusel infinito Jordan */}
      <div className="infinite-carousel">
        <div className="carousel-track">
          {[
            ...imagenesCarrusel,
            ...imagenesCarrusel,
            ...imagenesCarrusel,
            ...imagenesCarrusel,
          ].map((imagen, index) => (
            <img
              key={index}
              src={`/img/${imagen}`}
              alt={`Zapatilla Jordan ${(index % 8) + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Título de la colección */}
      <div className="titulo-tienda mb-4">
        <h1>
          Jordan
          <br />
          Best seller
        </h1>
      </div>

      {/* Estados de carga */}
      {cargando && (
        <p className="text-center text-white">
          Cargando productos Jordan...
        </p>
      )}

      {error && (
        <p className="text-center text-danger">
          {error}
        </p>
      )}

      {/* Catálogo desde Spring Boot */}
      <div
        className="grid-container"
        id="productos-contenedor"
      >
        {productos.map((producto) => (
          <div className="card" key={producto.id}>

            <Link
              to={`/detalle?id=${producto.id}`}
              className="slider"
              aria-label={`Ver detalles de ${producto.nombreModelo}`}
            >
              <div className="slide img-1">
                <img
                  src={obtenerImagen(producto.linkImagen)}
                  alt={producto.nombreModelo}
                />
              </div>
            </Link>

            <Link
              to={`/detalle?id=${producto.id}`}
              className="info text-decoration-none"
            >
              <span className="code">
                {producto.tipoCategoria || 'Jordan'}
              </span>

              <h2>{producto.nombreModelo}</h2>

              <p className="price">
                $ {Number(producto.precio).toLocaleString('es-CL')}
              </p>
            </Link>

            <Link
              to={`/compra?id=${producto.id}`}
              className="btn-buy mb-2"
            >
              Agregar al Carrito
            </Link>

            <Link
              to={`/detalle?id=${producto.id}`}
              className="btn-buy"
            >
              Ver Detalles
            </Link>

          </div>
        ))}
      </div>
    </main>
  );
}

export default Jordan;
