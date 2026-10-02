import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Table, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';

const HR = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [payments, setPayments] = useState([]);
  const [show, setShow] = useState(false); // Estado para controlar el modal
  const [folio, setFolio] = useState(''); // Estado para el folio
  const [selectedPaymentId, setSelectedPaymentId] = useState(null); // Estado para el pago seleccionado

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);

    fetchPayments(); // Llama a la función para obtener los pagos
  }, []);

  const fetchPayments = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('No se ha encontrado el ID de usuario.');
      return;
    }

    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/HR.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_usuario: userId }),
      });

      const result = await response.json();
      if (result.recibos) {
        setPayments(result.recibos);
      } else {
        alert(result.message || 'Error al obtener los pagos.');
      }
    } catch (error) {
      console.error('Error en la solicitud de pagos:', error);
      alert('Error al obtener los pagos. Inténtalo de nuevo.');
    }
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

  const handleShow = (paymentId) => {
    setSelectedPaymentId(paymentId); // Guardamos el ID del pago seleccionado
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleSubmit = async () => {
  if (!folio) {
    alert('Por favor, ingrese un folio.');
    return;
  }

  try {
    const response = await fetch('http://localhost/DWASAAcÁlamos/Back/HR.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_recibo: selectedPaymentId, // El ID del pago seleccionado
        folio: folio,
      }),
    });

    const result = await response.json();
    if (result.success) {
      alert('Folio guardado exitosamente.');
      setFolio(''); // Limpia el campo de folio después de guardarlo
      setShow(false); // Cierra el modal
      // Al hacer clic en "Aceptar" del alert, recargar la página
      window.location.reload();
    } else {
      alert(result.message || 'Error al guardar el folio.');
    }
  } catch (error) {
    console.error('Error al guardar el folio:', error);
    alert('Error al guardar el folio. Inténtalo de nuevo.');
  }
};


  return (
    <div>
      <NavBar userType={userType} />
      <div className="main-content">
        <header className="header">
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Image
                  src={profilePicture || "https://via.placeholder.com/50"}
                  roundedCircle
                  style={{ width: '60px', height: '60px' }}
                />
                <div className="ms-3">
                  <p className="mb-0">{email || 'correo@ejemplo.com'}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="danger">Cerrar Sesión</Button>
            </div>
          </Container>
        </header>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Folio de Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="folio">
                <Form.Label>Folio</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el folio de pago"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Guardar Folio
            </Button>
          </Modal.Footer>
        </Modal>

        <Container>
          <h1>Pagos</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Casa</th>
                <th>Total a Pagar</th>
                <th>Estado</th>
                <th>Folio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map((pago) => (
                <tr key={pago.Id_Recibo}>
                  <td>{pago.fecha}</td>
                  <td>
                    {(() => {
                      if (pago.Id_Casa >= 100 && pago.Id_Casa <= 172) {
                        return `A${pago.Id_Casa - 100}`;
                      } else if (pago.Id_Casa >= 200 && pago.Id_Casa <= 273) {
                        return `B${pago.Id_Casa - 200}`;
                      } else if (pago.Id_Casa >= 300 && pago.Id_Casa <= 374) {
                        return `C${pago.Id_Casa - 300}`;
                      } else {
                        return `ID fuera de secciones definidas (${pago.Id_Casa})`;
                      }
                    })()}
                  </td>
                  <td>{pago.Total_Pagar}</td>
                  <td
                  style={{
                    color: pago.estatus === 1
                      ? 'green'   // Pagado en verde
                      : pago.estatus === 0 && pago.Folio
                      ? '#FFA500' // En espera en naranja
                      : pago.estatus === 0 && (!pago.Folio || pago.Folio === '')
                      ? 'red'     // No pagado en rojo
                      : 'black',  // Color por defecto para cualquier otro estado
                    fontWeight: 'bold',  // Texto en negritas
                  }}
                >
                  {pago.estatus === 1
                    ? 'Pagado'
                    : pago.estatus === 0 && pago.Folio
                    ? 'En espera'
                    : pago.estatus === 0 && (!pago.Folio || pago.Folio === '')
                    ? 'No pagado'
                    : 'Desconocido'}
                </td>
                  <td>{pago.Folio}</td>
                  <td>
                    <Button variant="success" onClick={() => handleShow(pago.Id_Recibo)}>
                      Ya pagué
                    </Button>
                    <Button variant="dark">Descargar <i className="fa-solid fa-file-pdf"></i></Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center">No hay pagos disponibles.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Container>
      </div>
    </div>
  );
};

export default HR;
