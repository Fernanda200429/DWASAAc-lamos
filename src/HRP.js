import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';

const HRP = () => {
  const [userType, setUserType] = useState(null);
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [lecturas, setLecturas] = useState([]);
  const [idCasaFilter, setIdCasaFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const contentRef = useRef();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const storedUserType = localStorage.getItem('user_type');
    const storedEmail = localStorage.getItem('email');
    const storedProfilePicture = localStorage.getItem('profile_picture');

    if (storedUserType) setUserType(parseInt(storedUserType, 10));
    if (storedEmail) setEmail(storedEmail);
    if (storedProfilePicture) setProfilePicture(storedProfilePicture);

    if (storedUserId) {
      fetchCasaUsuario(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (idCasaFilter) {
      fetchLecturas(idCasaFilter);
    }
  }, [idCasaFilter]);

  const fetchCasaUsuario = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/DWASAAcÁlamos/Back/HPC.php?action=fetchCasaByUser&idUsuario=${userId}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setIdCasaFilter(data[0].id); 
      } else {
        throw new Error("No se encontraron casas asociadas.");
      }
    } catch (error) {
      console.error('Error al obtener la casa del usuario:', error);
      setError('No se pudo obtener la casa del usuario.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturas = async (idCasa) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/DWASAAcÁlamos/Back/HPC.php?action=fetchLecturas&idCasa=${idCasa}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setLecturas(data);
    } catch (error) {
      console.error('Error al obtener lecturas:', error);
      setError('No se pudo obtener el historial de lecturas.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatearFecha = (fecha) => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const fechaObj = new Date(fecha.replace(/-/g, '/'));
    if (isNaN(fechaObj)) return "Fecha inválida";

    const dia = fechaObj.getUTCDate();
    const mes = meses[fechaObj.getUTCMonth()];
    const año = fechaObj.getUTCFullYear();

    return `${dia}-${mes}-${año}`;
  };

  const calcularConsumoBimestral = (lecturas) => {
    const lecturasOrdenadas = [...lecturas].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
    
    return lecturasOrdenadas.map((lectura, index) => {
      let consumoBimestral = '-'; 
      let fechaInicio = '-';
      let fechaFin = '-';
      if (index < lecturasOrdenadas.length - 1) {
        const lecturaActual = lectura.Consumo;
        const lecturaAnterior = lecturasOrdenadas[index + 1].Consumo;
        consumoBimestral = lecturaActual - lecturaAnterior; 
        fechaInicio = formatearFecha(lecturasOrdenadas[index + 1].Fecha); 
        fechaFin = formatearFecha(lectura.Fecha); 
      }
      return { 
        ...lectura, 
        ConsumoBimestral: consumoBimestral, 
        FechaInicioBimestre: fechaInicio, 
        FechaFinBimestre: fechaFin 
      };
    });
  };

  const lecturasConConsumoBimestral = calcularConsumoBimestral(lecturas);

  const opcionesGrafica = {
    chart: {
      type: 'line',
      backgroundColor: '#f9f9f9',
      borderColor: '#ccc',
      borderWidth: 1,
      plotBorderColor: '#ccc',
      plotBackgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    title: {
      text: 'Consumo',
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
      }
    },
    xAxis: {
      categories: lecturasConConsumoBimestral
        .map((lectura) => `${lectura.FechaInicioBimestre} - ${lectura.FechaFinBimestre}`)
        .reverse(),
      title: {
        text: 'Periodo',
        style: {
          color: '#666',
        },
      },
      startOnTick: true,
      endOnTick: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Consumo (m³)',
        style: {
          color: '#666',
        },
      },
      tickInterval: 1,
      endOnTick: true,
    },
    series: [{
      name: 'Consumo',
      data: lecturasConConsumoBimestral.map(lectura => lectura.ConsumoBimestral === '-' ? 0 : lectura.ConsumoBimestral).reverse(),
      color: '#1100ff',
      lineWidth: 2,
      marker: {
        enabled: true,
        radius: 4,
        fillColor: '#fff',
        lineWidth: 2,
        lineColor: '#778899',
      },
      dataLabels: {
        enabled: true,
        format: '{point.y:.1f}',
        style: {
          color: '#333',
          textOutline: 'none',
        },
      },
    }],
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

  const generatePDF = () => {
    const input = contentRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('historial_lecturas.pdf');
    });
  };

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
        <Container className="text-center my-3">
          <Button variant="primary" onClick={generatePDF}>
            Descargar PDF
          </Button>
        </Container>
        <Container ref={contentRef}>
          <h2 className='text-center'>Historial de lecturas</h2>
          <Table striped bordered hover className="mt-4">
                <thead>
                  <tr>
                    <th>Fecha de toama de lectura</th>
                    <th>Fecha Inicio del periodo</th>
                    <th>Fecha Fin del periodo</th>
                    <th>Lectura</th>
                    <th>Consumo del periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturasConConsumoBimestral.map((lectura, index) => (
                    <tr key={index}>
                      <td>{formatearFecha(lectura.Fecha)}</td>
                      <td>{lectura.FechaInicioBimestre}</td>
                      <td>{lectura.FechaFinBimestre}</td>
                      <td>{lectura.Consumo}</td>
                      <td>{lectura.ConsumoBimestral === '-' ? '-' : lectura.ConsumoBimestral}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
          <HighchartsReact highcharts={Highcharts} options={opcionesGrafica} />
        </Container>
        
        {loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default HRP;
