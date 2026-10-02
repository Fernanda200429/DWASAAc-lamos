import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';

const LecturasN = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [lecturas, setLecturas] = useState([]);
  const [idCasaFilter, setIdCasaFilter] = useState('');
  const [letraFilter, setLetraFilter] = useState('');
  const [nuevaLectura, setNuevaLectura] = useState({ idCasa: '', fecha: '', consumo: '' });
  const [modalShow, setModalShow] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLectura, setCurrentLectura] = useState(null);
  const [casaOptions, setCasaOptions] = useState([]);
  const [numeroCasa, setNumeroCasa] = useState(''); // Nuevo estado para el número de casa

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);

    fetchLecturas();
    fetchCasaOptions();
  }, []);

  const fetchLecturas = async () => {
    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/AL.php');
      const data = await response.json();
      setLecturas(data);
    } catch (error) {
      console.error('Error al obtener las lecturas:', error);
    }
  };

  const fetchCasaOptions = async () => {
    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/AL.php?action=fetchCasas');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data); // Verifica qué datos se están obteniendo
      setCasaOptions(data);
    } catch (error) {
      console.error('Error al obtener las casas:', error);
    }
  };

  const handleModalClose = () => {
    setModalShow(false);
    setNuevaLectura({ idCasa: '', fecha: '', consumo: '' });
    setNumeroCasa(''); // Reiniciar el número de casa
    setIsEditMode(false);
    setCurrentLectura(null);
  };

  const obtenerIdCasa = (letra, numero) => {
    const idMap = {
      'A': { base: 100, count: 72 },
      'B': { base: 200, count: 73 },
      'C': { base: 300, count: 74 },
    };
    const section = idMap[letra];
    if (section) {
      return section.base + parseInt(numero, 10); // Calcula el ID basado en letra y número
    }
    return '';
  };

  const handleLetraChange = (e) => {
    const letra = e.target.value;
    setLetraFilter(letra);
    setNumeroCasa(''); // Reiniciar el número de casa al cambiar la letra
    setNuevaLectura({ ...nuevaLectura, idCasa: '' }); // Reiniciar ID Casa
  };

  const handleNumeroCasaChange = (e) => {
    const numero = e.target.value;
    const idCasa = obtenerIdCasa(letraFilter, numero);
    setNumeroCasa(numero);
    setNuevaLectura({ ...nuevaLectura, idCasa });
  };

  const agregarLectura = async () => {
    console.log("Datos a enviar:", nuevaLectura);

    try {
        const response = await fetch('http://localhost/DWASAAcÁlamos/Back/Recibo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevaLectura),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);

        if (result.Total_Pagar !== undefined) {
            alert(`Lectura agregada exitosamente. Total a pagar: ${result.Total_Pagar}`);
            fetchLecturas(); // Llamada a la función para actualizar las lecturas
            handleModalClose(); // Cerrar el modal después de la inserción
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error al agregar lectura:', error);
        alert('Error al agregar lectura. Inténtalo de nuevo.');
    }
};


  const editarLectura = async () => {
    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/AL.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...nuevaLectura, ID_Lectura: currentLectura.ID_Lectura }),
      });

      const result = await response.json();
      if (result.message) {
        alert(result.message);
        fetchLecturas();
        handleModalClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error al editar lectura:', error);
    }
  };

  const abrirModalAgregar = () => {
    setIsEditMode(false);
    setModalShow(true);
  };

  const abrirModalEditar = (lectura) => {
    setIsEditMode(true);
    setCurrentLectura(lectura);
    setNuevaLectura({ idCasa: lectura.ID_casa, fecha: lectura.Fecha, consumo: lectura.Consumo });
    setModalShow(true);
  };

  const eliminarLectura = async (idLectura) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta lectura?')) {
      try {
        const response = await fetch('http://localhost/DWASAAcÁlamos/Back/AL.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ID_Lectura: idLectura }),
        });

        const result = await response.json();
        if (result.message) {
          alert(result.message);
          fetchLecturas();
        } else {
          alert(result.error);
        }
      } catch (error) {
        console.error('Error al eliminar lectura:', error);
      }
    }
  };

  const filtrarLecturas = () => {
    return lecturas
        .filter(lectura => {
            const casaID = obtenerCasa(lectura.ID_casa);
            const letraCasa = casaID.charAt(0); // Obtener la letra de la casa
            const idCasa = lectura.ID_casa.toString();
            return (
                (idCasaFilter === '' || idCasa.includes(idCasaFilter)) &&
                (letraFilter === '' || letraFilter === letraCasa)
            );
        })
        .sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha)); // Ordenar de más reciente a más antiguo
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
      console.error('Error en la solicitud de cierre de sesión:', error);
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };
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

    return `${letra} ${numero}`; // Retornamos el formato "Letra-Número"
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
                <h2>Panel de Lecturas</h2>
                <h5>Bienvenido, {email}</h5>
              </div>
        <Container>
          <div className="d-flex justify-content-between my-4">
            <Button variant="primary" onClick={abrirModalAgregar}>
              <i className="fas fa-plus"></i> Agregar Lectura
            </Button>
          </div>
          <Form>
            <Form.Group controlId="formLetraFilter">
              <Form.Label>Sección</Form.Label>
              <Form.Select value={letraFilter} onChange={handleLetraChange}>
                <option value="">Seleccione una letra</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Form.Select>
            </Form.Group>
          </Form>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Casa</th>
                <th>Fecha</th>
                <th>Consumo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrarLecturas().map(lectura => (
                <tr key={lectura.ID_Lectura}>
                  <td>{obtenerCasa(lectura.ID_casa)}</td>
                  <td>{formatearFecha(lectura.Fecha)}</td>
                  <td>{lectura.Consumo}</td>
                  <td>
                    <Button variant="dark" onClick={() => abrirModalEditar(lectura)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="danger" onClick={() => eliminarLectura(lectura.ID_Lectura)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>

        <Modal show={modalShow} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditMode ? 'Editar Lectura' : 'Agregar Lectura'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formLetra">
                <Form.Label>Sección</Form.Label>
                <Form.Select value={letraFilter} onChange={handleLetraChange}>
                  <option value="">Seleccione una letra</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="formNumeroCasa">
                <Form.Label>Número de Casa</Form.Label>
                <Form.Control
                  type="text"
                  value={numeroCasa}
                  onChange={handleNumeroCasaChange}
                  placeholder="Ingrese el número de la casa"
                />
              </Form.Group>
              <Form.Group controlId="formFecha">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={nuevaLectura.fecha}
                  onChange={(e) => setNuevaLectura({ ...nuevaLectura, fecha: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="formConsumo">
                <Form.Label>Consumo</Form.Label>
                <Form.Control
                  type="number"
                  value={nuevaLectura.consumo}
                  onChange={(e) => setNuevaLectura({ ...nuevaLectura, consumo: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={isEditMode ? editarLectura : agregarLectura}>
              {isEditMode ? 'Guardar Cambios' : 'Agregar Lectura'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default LecturasN;
