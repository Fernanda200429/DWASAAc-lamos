// Panel.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar'; // Asegúrate de que la ruta sea correcta

const Folios = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [folios, setFolios] = useState([]); // Declarar estado para los folios

  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);

    // Llamada inicial para obtener los folios
    fetch('http://localhost/web-alamos-del-lago/Back/Folio.php', {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al obtener folios: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => setFolios(data.folios))
      .catch((error) => console.error(error.message));
  }, []);

  // Validar estatus
  const validarEstatus = (idRecibo) => {
    fetch('http://localhost/web-alamos-del-lago/Back/Folio.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Id_Recibo: idRecibo }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al validar estatus: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert('Estatus actualizado');
          // Actualizar la lista de folios
          setFolios((prevFolios) =>
            prevFolios.filter((folio) => folio.Id_Recibo !== idRecibo)
          );
        } else {
          alert('Error al actualizar el estatus');
        }
      })
      .catch((error) => console.error(error.message));
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('No se ha encontrado el ID de usuario.');
      return;
    }

    try {
      const response = await fetch('http://localhost/web-alamos-del-lago/Back/IS.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, action: 'logout' }),
      });

      if (!response.ok) {
        throw new Error(`Error al cerrar sesión: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        localStorage.clear();
        setUserType(null);
        window.location.href = '/inicio';
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error.message);
      alert('Error al cerrar sesión. Inténtalo de nuevo.');
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
                  src={profilePicture || 'https://via.placeholder.com/50'}
                  roundedCircle
                  style={{ width: '60px', height: '60px' }}
                />
                <div className="ms-3">
                  <p className="mb-0">{email || 'correo@ejemplo.com'}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="danger">
                Cerrar Sesión
              </Button>
            </div>
          </Container>
        </header>
        <Container>
          <h1 className='text-center'>Validar folios</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Casa</th>
                <th>Folio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {folios.map((folio) => (
                <tr key={folio.Id_Recibo}>
                  <td>{`${folio.Letra} ${folio.Numero}`}</td>
                  <td>{folio.Folio}</td>
                  <td>
                    <Button
                      variant="success"
                      onClick={() => validarEstatus(folio.Id_Recibo)}
                    >
                      Validar
                    </Button>
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

export default Folios;
   