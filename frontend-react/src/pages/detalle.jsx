
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/detalleReact.css';

function Detalle() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarProducto() {
      if (!id) {
        setError('No se seleccionó ningún producto.');
        setCargando(false);
        return;
      }

      setCargando(true);
      setError('');
      setProducto(null);

      try {
        const respuesta = await fetch(
          `http://localhost:8080/api/productos/${encodeURIComponent(id)}`,
          { signal: controlador.signal }
        );

        if (!respuesta.ok) {
          throw new Error('No se pudo obtener el producto');
        }

        const datos = await respuesta.json();
        setProducto(datos);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al cargar producto:', err);
          setError('No se pudo cargar el producto. Revisa el backend.');
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarProducto();

    return () => controlador.abort();
  }, [id]);

  function obtenerImagen(ruta) {
    if (!ruta) return '';

    if (/^https?:\/\//i.test(ruta)) {
      return ruta;
    }

    return `/${ruta.replace(/^\/+/, '')}`;
  }

  return (
    <main className="detalle-page">
      {cargando && (
        <p className="detalle-mensaje">
          Cargando producto...
        </p>
      )}

      {error && (
        <div className="detalle-error">
          <p>{error}</p>
          <Link to="/catalogo">Volver al catálogo</Link>
        </div>
      )}

      {!cargando && !error && producto && (
        <section className="product-hero">

          {/* Columna izquierda */}
          <div className="product-info">
            <h1 className="brand-name">
              {producto.tipoCategoria || 'Facture Sneakers'}
            </h1>

            <h2 className="product-title">
              {producto.nombreModelo}
            </h2>

            <p className="description">
              {producto.descripcion ||
                'Descubre este modelo exclusivo de nuestra colección.'}
            </p>

            <div className="purchase-area">
              <span className="price">
                ${Number(producto.precio).toLocaleString('es-CL')}
              </span>

              <Link
                to={`/compra?id=${producto.id}`}
                className="btn-buy"
              >
                Comprar Ahora
              </Link>

              <button
                type="button"
                className="btn-back"
                onClick={() => window.history.back()}
              >
                Volver atrás
              </button>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="product-display">

            <svg
              className="abstract-lines"
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="grad1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#FF3333"
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor="#ff9900"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <path
                d="M50,250 C150,50 350,50 450,250 C350,450 150,450 50,250 Z"
                stroke="url(#grad1)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M70,250 C160,80 340,80 430,250 C340,420 160,420 70,250 Z"
                stroke="url(#grad1)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M90,250 C170,110 330,110 410,250 C330,390 170,390 90,250 Z"
                stroke="url(#grad1)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M110,250 C180,140 320,140 390,250 C320,360 180,360 110,250 Z"
                stroke="url(#grad1)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M130,250 C190,170 310,170 370,250 C310,330 190,330 130,250 Z"
                stroke="url(#grad1)"
                strokeWidth="0.8"
                fill="none"
                opacity="0.4"
              />
            </svg>

            <img
              src={obtenerImagen(producto.linkImagen)}
              alt={producto.nombreModelo}
              className="main-shoe-img"
            />
          </div>
        </section>
      )}
    </main>
  );
}

export default Detalle;
