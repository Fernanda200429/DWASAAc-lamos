import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Container, Row, Col, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const defaultProfilePicture = 'https://github.com/FerRosas22/Integradora2/raw/main/User.jpg';

  const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Error fetching user info');
      }

      const userInfo = await userInfoResponse.json();
      const userEmail = userInfo.email;
      const profilePicture = userInfo.picture; // Obtén la URL de la imagen de perfil

      const response = await fetch('http://localhost/web-alamos-del-lago/Back/IS.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, action: 'check_user' }),
      });

      const result = await response.json();

      if (result.success) {
        // Aquí aseguramos que guardamos el user_id
        localStorage.setItem('user_id', result.user_id); // Almacena el user_id
        localStorage.setItem('email', userEmail);
        localStorage.setItem('user_type', result.user_type.toString());
        localStorage.setItem('profile_picture', profilePicture); // Almacena la imagen de perfil

        // Redirigir aquí
        if (['1', '2', '3'].includes(result.user_type.toString())) {
          window.location.href = '/Panel'; // Cambia esta línea según tu lógica de redirección
        } else {
          setErrorMessage('Tipo de usuario no autorizado.');
        }
      } else {
        console.error('Error: ', result);
        setErrorMessage(result.message || 'Error desconocido.');
      }
    } catch (error) {
      console.error('Error verifying user with Google:', error);
      setErrorMessage('Error en la solicitud: ' + error.message);
    }
  },
  onError: (error) => {
    console.log('Login Failed:', error);
    setErrorMessage('Error en la autenticación con Google.');
  },
});

  

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost/web-alamos-del-lago/Back/IS.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, action: 'login' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('user_id', result.user_id);
        localStorage.setItem('username', result.username);
        localStorage.setItem('user_type', result.user_type.toString());
        localStorage.setItem('email', email);

        const profilePicture = result.profile_picture || defaultProfilePicture;
        localStorage.setItem('profile_picture', profilePicture);

        if (['1', '2', '3'].includes(result.user_type.toString())) {
          window.location.href = '/Panel';
        } else {
          setErrorMessage('Tipo de usuario no autorizado.');
        }
      } else {
        setErrorMessage(result.message || 'Error desconocido.');
      }
    } catch (error) {
      setErrorMessage('Error en la solicitud: ' + error.message);
      console.error('Error details:', error);
    }
  };

  return (
    <div className="background-container bg-light text-center py-5">
      <Container className="h-100 text-center">
        <Row className="login-row no-gutters">
          <Col md={6} className="image-column"></Col>
          <Col md={6} className="form-column d-flex justify-content-center align-items-center">
            <Card className="login-box w-100">
              <Card.Body>
                <div className="text-center mb-4">
                  <h1 className="h4 text-gray-900">¡Bienvenid@ de vuelta!</h1>
                </div>
                <Form className="mb-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mb-3"
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicPassword">
                    <Form.Control
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mb-3"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    className="mb-3 w-100"
                    type="submit"
                  >
                    Iniciar Sesión
                  </Button>
                  {errorMessage && <div className="text-danger">{errorMessage}</div>}
                  <hr />
                </Form>
                <div className="button-container">
                  <Button
                    variant="danger"
                    className="mb-3 w-100"
                    onClick={login}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <FontAwesomeIcon icon={faGoogle} className="fa-lg mx-2" />
                      Inicia con Google
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
