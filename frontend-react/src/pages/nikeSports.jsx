
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import WebGLBackground from '../components/webGLBackground.jsx';
import '../styles/nikeUrban.css';

function NikeSports() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarProductos() {
      try {
        const respuesta = await fetch(
          'http://localhost:8080/api/productos/categoria/sports',
          { signal: controlador.signal }
        );

        if (!respuesta.ok) {
          throw new Error('No se pudieron obtener los productos');
        }

        const datos = await respuesta.json();

        setProductos(datos);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al cargar Nike Sports:', err);

          setError(
            'No se pudieron cargar los productos. Verifica que el backend de IntelliJ esté encendido.'
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

  // Imágenes originales de Nike Sports
  const imagenesCarrusel = [
    'm12.png',
    'm2.png',
    'm31.png',
    'ti.png',
    'e2.png',
    'f1 (1).png',
    'g1.png',
    'h1.png',
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

      {/* Fondo animado original */}
      <WebGLBackground />

      {/* Título */}
      <div className="titulo-tienda">
        <h1>SNEAKERS STORE</h1>
      </div>

      {/* Carrusel Nike Sports */}
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
              src={`/img/imgsp/${imagen}`}
              alt={`Zapatilla Nike Sports ${(index % 8) + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Título del catálogo */}
      <div className="titulo-tienda mb-4">
        <h1>
          Nike Sports
          <br />
          Best seller
        </h1>
      </div>

      {cargando && (
        <p className="text-center text-white">
          Cargando productos...
        </p>
      )}

      {error && (
        <p className="text-center text-danger">
          {error}
        </p>
      )}

      {/* Productos desde Spring Boot */}
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
                {producto.tipoCategoria || 'Nike Sports'}
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

export default NikeSports;
