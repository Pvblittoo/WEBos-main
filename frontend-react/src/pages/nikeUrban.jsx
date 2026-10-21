
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import WebGLBackground from '../components/webGLBackground.jsx';
import '../styles/nikeUrban.css';

function NikeUrban() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // OBTENER PRODUCTOS DESDE SPRING BOOT
  useEffect(() => {
    const controlador = new AbortController();

    async function cargarProductos() {
      try {
        const respuesta = await fetch(
          'http://localhost:8080/api/productos/categoria/urban',
          {
            signal: controlador.signal,
          }
        );

        if (!respuesta.ok) {
          throw new Error('No se pudieron obtener los productos');
        }

        const datos = await respuesta.json();

        setProductos(datos);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al cargar productos:', err);

          setError(
            'No se pudieron cargar los productos. Revisa que el backend de IntelliJ esté encendido.'
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarProductos();

    return () => {
      controlador.abort();
    };
  }, []);

  // IMÁGENES DEL CARRUSEL ORIGINAL
  const imagenesCarrusel = [
    '90.png',
    'NikeM2K.png',
    'air.png',
    'NikeField.png',
    'blazer.png',
    'ful.png',
    'tn.png',
    'nikeUrban.png',
  ];

  // CORREGIR RUTAS DE IMÁGENES DEL BACKEND
  function obtenerImagen(ruta) {
    if (!ruta) {
      return '';
    }

    if (/^https?:\/\//i.test(ruta)) {
      return ruta;
    }

    return `/${ruta.replace(/^\/+/, '')}`;
  }

  return (
    <main className="nike-urban-page">

      {/* FONDO ANIMADO WEBGL */}
      <WebGLBackground />

      {/* TÍTULO PRINCIPAL */}
      <div className="titulo-tienda">
        <h1>SNEAKERS STORE</h1>
      </div>

      {/* CARRUSEL INFINITO */}
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
              src={`/img/urban/${imagen}`}
              alt={`Zapatilla Nike Urban ${(index % 8) + 1}`}
            />
          ))}
        </div>
      </div>

      {/* TÍTULO DEL CATÁLOGO */}
      <div className="titulo-tienda mb-4">
        <h1>
          Nike Urban
          <br />
          Best seller
        </h1>
      </div>

      {/* MENSAJE DE CARGA */}
      {cargando && (
        <p className="text-center text-white">
          Cargando productos...
        </p>
      )}

      {/* MENSAJE DE ERROR */}
      {error && (
        <p className="text-center text-danger">
          {error}
        </p>
      )}

      {/* PRODUCTOS DEL BACKEND */}
      <div
        className="grid-container"
        id="productos-contenedor"
      >
        {productos.map((producto) => (
          <div
            className="card"
            key={producto.id}
          >

            {/* IMAGEN DEL PRODUCTO */}
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

            {/* INFORMACIÓN DEL PRODUCTO */}
            <Link
              to={`/detalle?id=${producto.id}`}
              className="info text-decoration-none"
            >
              <span className="code">
                {producto.tipoCategoria || 'Nike Urban'}
              </span>

              <h2>{producto.nombreModelo}</h2>

              <p className="price">
                $ {Number(producto.precio).toLocaleString('es-CL')}
              </p>
            </Link>

            {/* BOTÓN AGREGAR AL CARRITO */}
            <Link
              to={`/compra?id=${producto.id}`}
              className="btn-buy mb-2"
            >
              Agregar al Carrito
            </Link>

            {/* BOTÓN VER DETALLES */}
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

export default NikeUrban;
