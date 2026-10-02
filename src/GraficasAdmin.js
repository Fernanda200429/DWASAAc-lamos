// GraficasAdmin.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';

const GraficasAdmin = () => {
    const [userType, setUserType] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [consumoData, setConsumoData] = useState({ A: {}, B: {}, C: {} });

    useEffect(() => {
        const storedUserType = localStorage.getItem('user_type');
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedProfilePicture = localStorage.getItem('profile_picture');

        if (storedUserType) setUserType(parseInt(storedUserType, 10));
        if (storedUsername) setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
        if (storedProfilePicture) setProfilePicture(storedProfilePicture);

        // Fetch data from the backend
        fetch('http://localhost/DWASAAcÁlamos/Back/Reportes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Asumiendo que recibes los datos de cada sección por mes en un formato adecuado
                setConsumoData(data.consumoPorMes);
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
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

    // Datos para las gráficas
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Generación de los datos para las gráficas
    const meses = monthNames; // Usar los nombres de los meses
    const consumoGeneral = meses.map((_, index) => {
        // Sumar el consumo de todas las secciones para cada mes
        return (consumoData.A[index + 1] || 0) + (consumoData.B[index + 1] || 0) + (consumoData.C[index + 1] || 0);
    });

    const configGeneral = {
        title: {
            text: 'Consumo General Mensual'
        },
        xAxis: {
            categories: meses
        },
        yAxis: {
            title: {
                text: 'Consumo Total'
            }
        },
        series: [{
            name: 'Consumo General',
            type: 'column',
            data: consumoGeneral
        }]
    };

    const configSecciones = {
        title: {
            text: 'Consumo por Secciones'
        },
        xAxis: {
            categories: ['Sección A', 'Sección B', 'Sección C']
        },
        yAxis: {
            title: {
                text: 'Consumo Total'
            }
        },
        series: [{
            name: 'Consumo Total',
            type: 'column',
            data: [
                Object.values(consumoData.A).reduce((acc, val) => acc + val, 0), // Suma total para A
                Object.values(consumoData.B).reduce((acc, val) => acc + val, 0), // Suma total para B
                Object.values(consumoData.C).reduce((acc, val) => acc + val, 0)  // Suma total para C
            ]
        }]
    };

    const configPastel = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Distribución de Consumo por Secciones'
        },
        series: [{
            name: 'Consumo',
            data: [
                {
                    name: 'Sección A',
                    y: Object.values(consumoData.A).reduce((acc, val) => acc + val, 0),
                },
                {
                    name: 'Sección B',
                    y: Object.values(consumoData.B).reduce((acc, val) => acc + val, 0),
                },
                {
                    name: 'Sección C',
                    y: Object.values(consumoData.C).reduce((acc, val) => acc + val, 0),
                }
            ]
        }]
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
                    <h2 className="text-center">Gráficas de Consumo</h2>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={configGeneral}
                    />
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={configSecciones}
                    />
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={configPastel}
                    />
                    {/* Gráficas por Sección por Meses */}
                    {['A', 'B', 'C'].map((seccion) => (
                        <HighchartsReact
                            key={seccion}
                            highcharts={Highcharts}
                            options={{
                                title: {
                                    text: `Consumo Sección ${seccion} por Mes`
                                },
                                xAxis: {
                                    categories: meses
                                },
                                yAxis: {
                                    title: {
                                        text: 'Consumo'
                                    }
                                },
                                series: [{
                                    name: `Sección ${seccion}`,
                                    type: 'column',
                                    data: Object.values(consumoData[seccion]).map(value => value || 0) // Asegúrate de manejar los datos correctamente
                                }]
                            }}
                        />
                    ))}
                </Container>
            </div>
        </div>
    );
};

export default GraficasAdmin;
