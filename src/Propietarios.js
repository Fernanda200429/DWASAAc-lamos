import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Spinner, Modal, Form, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Panel.css';
import NavBar from './NavBar';

const Propietarios = () => {
  const [userType, setUserType] = useState(null);
  const [casas, setCasas] = useState([]);
  const [usuariosTipo3, setUsuariosTipo3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCasa, setCurrentCasa] = useState({ Propietario: '', id_usuario: '', Id_Casa: '' });
  const [profilePicture, setProfilePicture] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedProfilePicture = localStorage.getItem('profile_picture');
    const storedEmail = localStorage.getItem('email');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);
    if (storedEmail) setEmail(storedEmail);

    const fetchData = async () => {
      try {
        // Obtener casas
        const casasResponse = await fetch('http://localhost/DWASAAcÁlamos/Back/Propietarios.php');
        const casasData = await casasResponse.json();
        if (casasData.success) {
          setCasas(casasData.casas);
        } else {
          alert(casasData.message);
        }

        // Obtener usuarios Tipo 3
        const usuariosResponse = await fetch('http://localhost/DWASAAcÁlamos/Back/Propietarios.php?getUsuariosTipo3=true');
        const usuariosData = await usuariosResponse.json();
        if (usuariosData.success) {
          setUsuariosTipo3(usuariosData.usuarios);
        } else {
          alert(usuariosData.message);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('No se ha encontrado el ID de usuario.');
      return;
    }

    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/IS.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleShowModal = (casa = { Propietario: '', id_usuario: '', Id_Casa: '' }) => {
    setCurrentCasa(casa);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const { Propietario, id_usuario } = currentCasa;

    const formData = new FormData();
    formData.append('editarCasa', true);
    formData.append('Id_Casa', currentCasa.Id_Casa);
    formData.append('Propietario', Propietario);
    formData.append('id_usuario', id_usuario);

    fetch('http://localhost/DWASAAcÁlamos/Back/Propietarios.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          setCasas((prevCasas) =>
            prevCasas.map((casa) =>
              casa.Id_Casa === currentCasa.Id_Casa ? { ...casa, Propietario, id_usuario } : casa
            )
          );
        } else {
          alert(data.message);
        }
        handleCloseModal();
      })
      .catch((error) => {
        console.error('Error al actualizar casa:', error);
        alert('Error al actualizar casa');
        handleCloseModal();
      });
  };

  const handleDelete = (casaId) => {
    const formData = new FormData();
    formData.append('borrarCasa', true);
    formData.append('Id_Casa', casaId);

    fetch('http://localhost/DWASAAcÁlamos/Back/Propietarios.php', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Casa desvinculada del propietario y usuario.');
          setCasas((prevCasas) => prevCasas.filter((casa) => casa.Id_Casa !== casaId));
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error al eliminar propietario:', error);
        alert('Error al eliminar propietario');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCasa((prevCasa) => ({
      ...prevCasa,
      [name]: value,
    }));
  };

  const handleUserSelect = (e) => {
    const selectedUser = e.target.value;
    setCurrentCasa((prevCasa) => ({
      ...prevCasa,
      id_usuario: selectedUser,
    }));
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
        <Container className="mt-4">
          <h2 className="mt-4">Lista de Casas</h2>
          {loading ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Casa</th>
                  <th>Propietario</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {casas.map((casa) => {
                  return (
                    <tr key={casa.Id_Casa}>
                      <td>{casa.Letra} {casa.Numero}</td>
                      <td>{casa.Propietario}</td>
                      <td>
                        {casa.id_usuario}
                      </td>
                      <td>
                        <Button variant="info" size="sm" onClick={() => handleShowModal(casa)}>
                          Detalles
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(casa.Id_Casa)}
                          className="ms-2"
                        >
                          Borrar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Container>
      </div>

      {/* Modal para agregar/editar casa */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Casa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCasa">
              <Form.Label>Casa</Form.Label>
              <Form.Control
                type="text"
                value={currentCasa.Propietario}
                onChange={handleChange}
                name="Propietario"
                required
              />
            </Form.Group>
            <Form.Group controlId="formUsuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control as="select" value={currentCasa.id_usuario} onChange={handleUserSelect} name="id_usuario">
                <option value="">Seleccionar usuario</option>
                {usuariosTipo3.map((usuario) => (
                  <option key={usuario.id_usuario} value={usuario.id_usuario}>
                    {usuario.Correo}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Propietarios;
