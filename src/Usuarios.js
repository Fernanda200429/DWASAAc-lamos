import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Table, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUserCheck, faUserSlash , faTrash} from '@fortawesome/free-solid-svg-icons';
import './Panel.css';
import NavBar from './NavBar';

const Usuarios = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserContraseña, setNewUserContraseña] = useState('');
  const [newUserTipo, setNewUserTipo] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserTipo, setCurrentUserTipo] = useState(1);
  const [currentUserContraseña, setCurrentUserContraseña] = useState('');

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/U.php');
      const text = await response.text();
  
      // Verifica si el texto comienza con un caracter válido de JSON (como '{' o '[')
      if (text.startsWith('<')) {
        console.error('La respuesta no es JSON. Recibido HTML:', text);
        return;
      }
  
      const data = JSON.parse(text);
  
      if (data.success) {
        setUsers(data.usuarios);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };
  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      fetch(`http://localhost/DWASAAcÁlamos/Back/U.php?id=${userId}`, {
        method: 'DELETE',
      })
        .then(response => {
          if (response.ok) {
            setUsers(users.filter(user => user.Id !== userId));
            alert('Usuario eliminado con éxito.');
          } else {
            alert('Error al eliminar el usuario.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Hubo un problema al eliminar el usuario.');
        });
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
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
    }
  };

  const handleAddUser = async () => {
    const newUser = {
      email: newUserEmail,
      Contraseña: newUserContraseña,
      tipo_usuario: newUserTipo,
    };

    await addUser(newUser);
    setShowModal(false);
    setNewUserEmail('');
    setNewUserContraseña('');
    setNewUserTipo(1);
  };

  const addUser = async (user) => {
    try {
      const response = await fetch('http://localhost/DWASAAcÁlamos/Back/U.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          agregarUsuario: true,
          Correo: user.email,
          Contraseña: user.Contraseña, // Enviarlo con el nombre correcto
          tipo_usuario: user.tipo_usuario,
        }),
        
      });
      const data = await response.json();
      // console.log('Respuesta del servidor:', data); // Comentado para evitar sobrecarga de logs
      fetchUsers();
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUserId(user.Id);
    setCurrentUserEmail(user.Correo);
    setCurrentUserTipo(user.Tipo);
    setCurrentUserContraseña('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    const updatedUser = {
      id: currentUserId,
      email: currentUserEmail,
      Contraseña: currentUserContraseña,
      tipo_usuario: currentUserTipo,
    };

    await editUser(updatedUser);
    setShowEditModal(false);
  };

  async function editUser(user) {
    try {
      const response = await fetch("http://localhost/DWASAAcÁlamos/Back/U.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          editarUsuario: true,
          id: user.id,
          Correo: user.email,
          Contraseña: user.Contraseña, // Cambiado a "Contraseña" en lugar de "Ccontraseña"
          tipo_usuario: user.tipo_usuario
        })
      });
  
      if (!response.ok) {
        console.error('Error al editar usuario:', response.status);
        return;
      }
  
      const result = await response.text();
      if (result.includes("Error")) {
        console.error('Error en la respuesta del servidor:', result);
      } else {
        console.log('Usuario editado con éxito:', result);
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error en la petición de edición de usuario:', error);
    }
  }
  

  const handleChangeStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    console.log(`Cambiando estado de usuario ${userId} a ${newStatus}`);
    await changeUserStatus(userId, newStatus);
  };

  const changeUserStatus = async (id, estatus) => {
    try {
      const response = await fetch(`http://localhost/DWASAAcÁlamos/Back/U.php?cambiarEstatus=true&id=${id}&estatus=${estatus}`);
      const data = await response.json();
      if (data.success) {
        console.log(`Estatus de usuario ${id} cambiado a ${estatus}`);
      } else {
        console.error(data.message);
      }
      fetchUsers();
    } catch (error) {
      console.error('Error al cambiar el estatus:', error);
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
              <Button onClick={handleLogout} variant="outline-danger">Cerrar Sesión</Button>
            </div>
          </Container>
        </header>

        <Container className="mt-4">
          <h2>Usuarios</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>Agregar Usuario</Button>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {users.map(user => (
    <tr key={user.Id}> {/* Eliminado espacio aquí */}
      <td>{user.Correo}</td>
      <td>
        {parseInt(user.Tipo) === 1 ? "Administrador" : parseInt(user.Tipo) === 2 ? "Lecturista" : parseInt(user.Tipo) === 3 ? "Residente" : "Desconocido"}
      </td>
      <td>{parseInt(user.Estatus) === 1 ? "Activo" : "Suspendido"}</td>
      <td>
        <Button
          variant="warning"
          onClick={() => handleEditUser(user)}
          style={{ marginRight: '5px' }} // Espacio a la derecha
        >
          <FontAwesomeIcon icon={faEdit} />
        </Button>
          <Button
          variant={user.Estatus === "1" || user.Estatus === 1 ? 'dark' : 'primary'}
          onClick={() => handleChangeStatus(user.Id, user.Estatus)}
          style={{ marginRight: '5px' }} // Espacio a la derecha
        >
          {user.Estatus === "1" || user.Estatus === 1 ? (
            <FontAwesomeIcon icon={faUserSlash} />
            ) : (
           <FontAwesomeIcon icon={faUserCheck} />
                )}
              </Button>
              <Button onClick={() => handleDeleteUser(user.Id)} variant="danger" className="ms-2">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </td>
              </tr>
            ))}
          </tbody>
          </Table>
        </Container>

        {/* Modal para agregar usuario */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={newUserContraseña}
                  onChange={e => setNewUserContraseña(e.target.value)}
                />
              </div>
              <div className="form-group">
              <label htmlFor="tipo">Tipo de Usuario</label>
              <select
                className="form-control"
                id="tipo"
                value={newUserTipo || ""}
                onChange={e => setNewUserTipo(e.target.value ? parseInt(e.target.value, 10) : "")}
              >
                <option value="">Seleccione un tipo de usuario</option>
                <option value={1}>Administrador</option>
                <option value={2}>Lecturista</option>
                <option value={3}>Residente</option>
              </select>
            </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAddUser}>Agregar</Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para editar usuario */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="editEmail">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="editEmail"
                  value={currentUserEmail}
                  onChange={e => setCurrentUserEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPassword">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  id="editPassword"
                  value={currentUserContraseña}
                  onChange={e => setCurrentUserContraseña(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editTipo">Tipo de Usuario</label>
                <select
                  className="form-control"
                  id="editTipo"
                  value={currentUserTipo}
                  onChange={e => setCurrentUserTipo(parseInt(e.target.value, 10))}>
                  <option value={1}>Administrador</option>
                  <option value={2}>Lecturista</option>
                  <option value={3}>Reciedente</option>
                </select>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdateUser}>Guardar Cambios</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Usuarios;
