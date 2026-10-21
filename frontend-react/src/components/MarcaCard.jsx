
import { Link } from 'react-router-dom';

function MarcaCard({ nombre, imagen, fondo, ruta }) {
  return (
    <div className="col-md-4">
      <div
        className="card brand-card bg-bulls-dark text-white h-100 shadow"
        style={{
          backgroundImage: `url("${fondo}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="card-body text-center d-flex flex-column justify-content-between">
          <div>
            <h3 className="card-title fw-bold text-bulls-red mb-3">
              {nombre}
            </h3>

            <img
              src={imagen}
              alt={`Logo ${nombre}`}
              className="img-fluid"
            />
          </div>

          <Link to={ruta} className="btn btn-bulls mt-3">
            Ver Colección
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MarcaCard;
