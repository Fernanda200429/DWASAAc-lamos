import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Form, Table, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Panel.css';
import NavBar from './NavBar';

const Inforecibos = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [fecha, setFecha] = useState('');
  const [totalRecibo, setTotalRecibo] = useState('');
  const [recibos, setRecibos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentReciboId, setCurrentReciboId] = useState(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);

    fetchRecibos(); // Cargar recibos al cargar el componente
  }, []);

  const fetchRecibos = async () => {
    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/CEA.php');
      const data = await response.json();
      setRecibos(data.recibos || []); // Guardar los recibos en el estado
    } catch (error) {
      console.error('Error al cargar los recibos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { fecha, totalRecibo };

    if (editMode) {
      // Si está en modo de edición, enviar solicitud de PUT
      data.id = currentReciboId; // Agregar el ID del recibo a editar

      try {
        const response = await fetch('http://localhost/DWASAAcÁlamos/Back/CEA.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.success) {
          alert("Recibo editado con éxito.");
          fetchRecibos(); // Actualizar la tabla con los nuevos datos
          resetForm(); // Limpiar el formulario
          setShowModal(false); // Cerrar el modal
        } else {
          alert("Error al editar el recibo: " + result.message);
        }
      } catch (error) {
        console.error('Error al editar los datos:', error);
        alert('Error en la edición de datos. Intenta de nuevo.');
      }
    } else {
      // Si está en modo de agregar, enviar solicitud de POST
      try {
        const response = await fetch('http://localhost/DWASAAcÁlamos/Back/CEA.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.success) {
          alert("Recibo registrado con éxito.");
          fetchRecibos(); // Actualizar la tabla con los nuevos datos
          resetForm(); // Limpiar el formulario
          setShowModal(false); // Cerrar el modal
        } else {
          alert("Error al registrar el recibo: " + result.message);
        }
      } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Error en el envío de datos. Intenta de nuevo.');
      }
    }
  };

  const resetForm = () => {
    setFecha('');
    setTotalRecibo('');
    setEditMode(false);
    setCurrentReciboId(null);
  };

  const eliminarRecibo = async (idRecibo) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este recibo?')) {
      try {
        const response = await fetch('http://localhost/DWASAAcÁlamos/Back/CEA.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: idRecibo }), // Asegúrate de que el ID esté en el formato correcto
        });

        const result = await response.json();
        if (result.message) {
          alert(result.message);
          fetchRecibos(); // Actualiza la lista de recibos
        } else {
          alert("Error al eliminar el recibo.");
        }
      } catch (error) {
        console.error('Error al eliminar el recibo:', error);
        alert('Error al eliminar el recibo. Intenta de nuevo.');
      }
    }
  };

  const editarRecibo = (recibo) => {
    setFecha(recibo.Fecha);
    setTotalRecibo(recibo.Total_Recibo);
    setEditMode(true);
    setCurrentReciboId(recibo.ID); // Establecer el ID del recibo actual
    setShowModal(true); // Abrir el modal en modo de edición
  };

  const abrirModal = () => {
    resetForm(); // Limpiar el formulario antes de abrir el modal
    setShowModal(true);
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
              <Button onClick={() => localStorage.clear()} variant="danger">Cerrar Sesión</Button>
            </div>
          </Container>
        </header>
        <Container>
          <h1 className="mt-4">Gestión de Recibos de CEA</h1>
          <Button variant="primary" onClick={abrirModal}>
            Agregar Recibo
          </Button>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{editMode ? 'Editar Recibo' : 'Agregar Recibo'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formFecha">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formTotalRecibo">
                  <Form.Label>Total Recibo de CEA</Form.Label>
                  <Form.Control
                    type="number"
                    value={totalRecibo}
                    onChange={(e) => setTotalRecibo(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  {editMode ? 'Actualizar Recibo' : 'Agregar Recibo'}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total Recibo de CEA</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo) => (
                <tr key={recibo.ID}>
                  <td>{recibo.Fecha}</td>
                  <td>{recibo.Total_Recibo}</td>
                  <td>
                    <Button variant="warning" onClick={() => editarRecibo(recibo)}>Editar</Button>
                    <Button variant="danger" onClick={() => eliminarRecibo(recibo.ID)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </div>
    </div>
  );
};

export default Inforecibos;
