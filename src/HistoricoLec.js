import React, { useState, useEffect } from 'react'; 
import { Container, Button, Table, Form, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';

const HistoricoLec = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [lecturas, setLecturas] = useState([]);
  const [seccion, setSeccion] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [idCasa, setIdCasa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);
  }, []);

  const fetchLecturas = async () => {
    if (!idCasa) return;
    setLoading(true);
    setErrorMessage('');
    try {
        const response = await fetch(`http://localhost/DWASAAcÁlamos/Back/Buscador.php?action=fetchLecturas&idCasa=${idCasa}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        console.log('Datos recibidos:', data);

        if (Array.isArray(data) && data.length > 0) {
            setLecturas(data);
        } else {
            setLecturas([]);
            setErrorMessage('No se encontraron lecturas.');
        }
    } catch (error) {
        console.error('Error al obtener las lecturas:', error);
        setErrorMessage('Error al obtener las lecturas. Intente de nuevo.');
    } finally {
        setLoading(false);
    }
  };

  const fetchIdCasa = async () => {
    if (!seccion || !numeroCasa) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`http://localhost/DWASAAcÁlamos/Back/Buscador.php?action=fetchIdCasa&Letra=${seccion}&Numero=${numeroCasa}`);
      if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();

      if (data.idCasa && data.idCasa.length > 0) {
        setIdCasa(data.idCasa[0].ID_casa);
        setLecturas([]); // Limpia las lecturas anteriores
      } else {
        alert('Casa no encontrada');
        setLecturas([]);
        setIdCasa(null);
      }
    } catch (error) {
      console.error('Error al obtener el ID de la casa:', error);
      setErrorMessage('Error al obtener el ID de la casa. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    fetchIdCasa();
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('No se ha encontrado el ID de usuario.');
      return;
    }

    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/IS.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, action: 'logout' }),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.clear();
        setUserType(null);
        window.location.href = '/inicio';
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    if (idCasa) {
      fetchLecturas();
    }
    console.log('Lecturas actuales:', lecturas);
  }, [idCasa]);
  function obtenerCasa(ID_casa) {
    let letra = '';
    let numero = 0;

    if (ID_casa >= 101 && ID_casa <= 172) {
        letra = 'A';
        numero = ID_casa - 100; // Restamos 100 para obtener el número de la casa
    } else if (ID_casa >= 201 && ID_casa <= 273) {
        letra = 'B';
        numero = ID_casa - 200; // Restamos 200 para obtener el número de la casa
    } else if (ID_casa >= 301 && ID_casa <= 374) {
        letra = 'C';
        numero = ID_casa - 300; // Restamos 300 para obtener el número de la casa
    }

    return `${letra}-${numero}`; // Retornamos el formato "Letra-Número"
}
function formatearFecha(fecha) {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                 "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  
  // Convertir la fecha a formato estándar si es necesario
  const fechaObj = new Date(fecha.replace(/-/g, '/')); // Asegurar formato correcto

  // Verificar si la fecha es válida
  if (isNaN(fechaObj)) {
      return "Fecha inválida";
  }

  // Obtener el día, mes y año
  const dia = fechaObj.getUTCDate(); // Corregir día
  const mes = meses[fechaObj.getUTCMonth()]; // Obtener el mes en letras
  const año = fechaObj.getUTCFullYear();

  return `${dia}-${mes}-${año}`;
}
  return (
    <div>
      <NavBar userType={userType} />
      <div className="main-content">
        <header className="header">
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img
                  src={profilePicture || "https://via.placeholder.com/50"}
                  alt="Perfil"
                  className="rounded-circle"
                  style={{ width: '60px', height: '60px' }}
                />
                <div className="ms-3">
                  <p className="mb-0">{email || 'correo@ejemplo.com'}</p>
                </div>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar sesión
              </Button>
            </div>
          </Container>
        </header>
        <div className="header-text text-center">
          <h2>Historial de lecturas</h2>
          <h5>Bienvenido, {email}</h5>
        </div>
        <Container>
          <Form onSubmit={handleBuscar}>
            <Form.Group controlId="formSeccion">
              <Form.Label>Sección</Form.Label>
              <Form.Control
                type="text"
                value={seccion}
                onChange={e => setSeccion(e.target.value)}
                placeholder="Ingrese la sección"
              />
            </Form.Group>
            <Form.Group controlId="formNumeroCasa">
              <Form.Label>Número de Casa</Form.Label>
              <Form.Control
                type="text"
                value={numeroCasa}
                onChange={e => setNumeroCasa(e.target.value)}
                placeholder="Ingrese el número de casa"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Buscar Lecturas
            </Button>
          </Form>
          {loading && <Spinner animation="border" className="mt-3" />}
          {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>ID Casa</th>
                <th>Fecha</th>
                <th>Consumo</th>
              </tr>
            </thead>
            <tbody>
              {lecturas.length > 0 ? (
                lecturas.map(lectura => (
                  <tr key={lectura.ID_Lectura}>
                    <td>{obtenerCasa(lectura.ID_casa)}</td>
                    <td>{formatearFecha(lectura.Fecha)}</td>
                    <td>{lectura.Consumo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No hay lecturas disponibles</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Container>
      </div>
    </div>
  );
};

export default HistoricoLec;
