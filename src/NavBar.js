// NavBar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const NavBar = ({ userType }) => {
  return (
    <nav className="col-md-3 col-lg-2 d-md-block sidebar">
      <div className="position-sticky">
        <ul className="nav flex-column">
          {userType === 1 || userType === null ? (
            <>
              <li className="nav-item">
                <Link className="nav-link active" to="/Panel">
                  <i className="fas fa-home me-2"></i> Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Usuarios">
                  <i className="fas fa-user me-2"></i> Usuarios
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Propietarios">
                  <i className="fas fa-home me-2"></i> Propietarios
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Folios">
                  <i className="fa-solid fa-sack-dollar me-2"></i> Validar Folios de pago
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Inforecibos">
                  <i className="fas fa-file-invoice me-2"></i> Recibos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/LecturasN">
                  <i className="fas fa-book-open me-2"></i> Lecturas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/HistoricoLec">
                  <i className="fas fa-history me-2"></i> Historial Lecturas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Reportes">
                  <i className="fas fa-file-export me-2"></i> Reportes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/ReportesCF">
                  <i className="far fa-question-circle me-2"></i> Reportes por secciones
                </Link>
              </li>
              <li className="nav-item">
              <Link className="nav-link" to="/ReportesF">
                <i className="far fa-calendar-alt"></i> Reportes por fechas
              </Link>
            </li>

              <li className="nav-item">
                <Link className="nav-link" to="/GraficasAdmin">
                  <i className="fas fa-chart-line me-2"></i> Gráficas
                </Link>
              </li>
            </>
          ) : userType === 2 ? (
            <>
              <li className="nav-item">
                <Link className="nav-link active" to="/Panel">
                  <i className="fas fa-home me-2"></i> Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/LecturasN">
                  <i className="fas fa-file-alt me-2"></i> Registrar lectura
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/HistoricoLec">
                  <i className="fas fa-history me-2"></i> Historial de lecturas
                </Link>
              </li>
            </>
          ) : userType === 3 ? (
            <>
              <li className="nav-item">
                <Link className="nav-link active" to="/Panel">
                  <i className="fas fa-home me-2"></i> Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Recibos">
                  <i className="fas fa-file-invoice me-2"></i> Recibo actual
                </Link>
              </li>
              <li className="nav-item">
  <Link className="nav-link" to="/HistR">
    <i className="fa-solid fa-list me-2"></i> Lista de recibos
  </Link>
</li>

              <li className="nav-item">
                <Link className="nav-link" to="/HRP">
                  <i className="fas fa-history me-2"></i> Historial de lecturas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/HR">
                  <i className="fas fa-calendar-day me-2"></i> Historial de Recibos
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <span className="nav-link">Tipo de usuario no reconocido.</span>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
