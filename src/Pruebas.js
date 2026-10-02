import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import './Recibos.css';
import NavBar from './NavBar';

const Recibos = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [reciboData, setReciboData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 
    'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formatearFecha = (fecha) => {
    const [año, mes, día] = fecha.split('-');
    return `${parseInt(día)} de ${meses[parseInt(mes) - 1]} de ${año}`;
  };

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

  useEffect(() => {
    const fetchReciboData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        alert('No se ha encontrado el ID de usuario.');
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch(`http://localhost/DWASAAcÁlamos/Back/ObtenerRecibos.php?idUsuario=${userId}`);
        if (!response.ok) throw new Error('Error en la solicitud, no se pudo obtener la respuesta.');
        
        const textResponse = await response.text();
        try {
          const data = JSON.parse(textResponse);
          if (data.error) {
            setError(data.error);
          } else {
            setReciboData(data);
          }
        } catch (error) {
          setError('Error al procesar los datos de recibo.');
          console.error('Error al parsear la respuesta JSON:', error);
        }
  
      } catch (error) {
        setError(`Error al obtener los datos. ${error.message}`);
        console.error('Error en la solicitud:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchReciboData();
  }, []);

  const handleLogout = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('No se ha encontrado el ID de usuario.');
      return;
    }

    try {
      const response = await fetch('http://localhost/DWASAAcÁlamosSS/Back/IS.php', {
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

  if (loading) {
    return (
      <div>
        <NavBar userType={userType} />
        <div className="main-content">
          <Container className="mt-4 text-center">
            <p>Cargando datos del recibo...</p>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar userType={userType} />
        <div className="main-content">
          <Container className="mt-4 text-center">
            <p>{error}</p>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar userType={userType} />
      <div className="main-content">
        <header className="header">
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Image src={profilePicture || "https://via.placeholder.com/50"} roundedCircle style={{ width: '60px', height: '60px' }} />
                <div className="ms-3">
                  <p className="mb-0">{email || 'correo@ejemplo.com'}</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="danger">Cerrar Sesión</Button>
            </div>
          </Container>
        </header>

        <Container className="mt-4">
          <Card className="recibo-container">
            <Card.Body>
              <Card.Img variant="top" src="https://raw.githubusercontent.com/FerRosas22/job/main/Logo.png" className="logo" />
              <Card.Title className="text-center mt-3">Asociación de Condominios Álamos del Lago AC</Card.Title>
              <Card.Subtitle className="mb-2 text-muted text-center">RECIBO DE AGUA</Card.Subtitle>
              <hr />
              <div className="alerta mt-3">
                LA FECHA LIMITE DE PAGO SON LOS DÍAS 15 DE CADA MES DESPUES DEL 15 SE REALIZA UNA CARGO DE 10% AL TOTAL A PAGAR
              </div>
              <Row className="mt-3">
                <Col>
                  <div className="datos-casa">
                    <strong>N°CASA:</strong> {reciboData.Numero}<br />
                    <strong>SECCIÓN:</strong> {reciboData.Letra}<br />
                    <strong>N° REFERENCIA:</strong> {reciboData.Id_Casa}<br />
                    <strong>PROPIETARIO:</strong> {reciboData.Propietario}
                  </div>
                </Col>
                <Col className="text-end">
                  <div className="recibo-periodo">
                    <strong>RECIBO DEL PERÍODO:</strong><br />
                    {formatearFecha(reciboData.Fecha_Lectura)}
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  <div className="total">
                    <strong>FECHA LÍMITE DE PAGO:</strong><br />
                    15{formatearFecha(reciboData.Fecha_Lectura(Mes))} 2024 DESPUÉS 10% DE RECARGO
                  </div>
                </Col>
                <Col md={6} className="text-end"> <Card className="p-3 shadow-sm"> <Card.Body> <Card.Title className="mb-3 text-primary">TOTAL RECIBO DE CEA:</Card.Title> <Card.Text as="h4"> ${reciboData.Total_Recibo.toFixed(2)} </Card.Text> </Card.Body> </Card> </Col>
              </Row>

              <table className="table mt-4">
                <thead>
                  <tr>
                    <th>LECTURA INICIAL</th>
                    <th>LECTURA FINAL</th>
                    <th>SU CONSUMO DEL MES (M3)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{reciboData.Lectura_Anterior}</td>
                    <td>{reciboData.Lectura_Actual}</td>
                    <td>{reciboData.Canconsumo}</td>
                  </tr>
                </tbody>
              </table>

              <Row className="mt-3">
                <Col>
                  <div className="total text-start">
                    <strong>COSTO POR M3:</strong> $45
                  </div>
                </Col>
                <Col className="text-end">
                  <div>
                    <strong>SU CONSUMO DEL MES ($):</strong> {reciboData.ConsumoM}
                  </div>
                </Col>
              </Row>

              <Row className="totales mt-3">
                <Col>
                  <div className="text-start">
                    <strong>CUOTA GENERAL DE SANEAMIENTO</strong> $53.00
                  </div>
                </Col>
                <Col className="text-end">
                  <strong>TOTAL A PAGAR ($):</strong> {reciboData.Total_Pagar}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Recibos;
