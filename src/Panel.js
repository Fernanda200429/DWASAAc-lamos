// Panel.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar'; // Asegúrate de que la ruta sea correcta

const Panel = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

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

  const handleLogout = async () => {
    const userId = localStorage.getItem('user_id'); 
    console.log('User ID:', userId);

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
        console.log(result);
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
          {/* Aquí puedes agregar el contenido específico del panel */}
        </Container>
      </div>
    </div>
  );
};

export default Panel;
