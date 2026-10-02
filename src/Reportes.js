import React, { useState, useEffect } from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as XLSX from 'xlsx'; // Para exportar a Excel
import jsPDF from 'jspdf'; // Para exportar a PDF
import html2canvas from 'html2canvas';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Reportes = () => {
    const [userType, setUserType] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [consumoData, setConsumoData] = useState({ A: {}, B: {}, C: {}, general: {} });

    useEffect(() => {
        const storedUserType = localStorage.getItem('user_type');
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedProfilePicture = localStorage.getItem('profile_picture');

        if (storedUserType) setUserType(parseInt(storedUserType, 10));
        if (storedUsername) setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
        if (storedProfilePicture) setProfilePicture(storedProfilePicture);

        fetch('http://localhost/DWASAAcÁlamos/Back/Reportes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                setConsumoData(data.consumoPorMes);
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
    }, []);

    const meses = Object.keys(consumoData.A || {});

    const obtenerNombreMes = (mesNumero) => {
        const mesesNombres = {
            '01': 'Enero',
            '02': 'Febrero',
            '03': 'Marzo',
            '04': 'Abril',
            '05': 'Mayo',
            '06': 'Junio',
            '07': 'Julio',
            '08': 'Agosto',
            '09': 'Septiembre',
            '10': 'Octubre',
            '11': 'Noviembre',
            '12': 'Diciembre'
        };
        return mesesNombres[mesNumero] || mesNumero;
    };

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

    // Preparar los datos para la gráfica
    const prepareChartData = () => {
        const categories = meses.map(mes => {
            const mesNumero = mes.substring(5, 7);
            return obtenerNombreMes(mesNumero) + ' ' + mes.substring(0, 4);
        });

        const dataA = meses.map(mes => consumoData.A[mes] || 0);
        const dataB = meses.map(mes => consumoData.B[mes] || 0);
        const dataC = meses.map(mes => consumoData.C[mes] || 0);
        const dataGeneral = meses.map(mes => consumoData.general[mes] || 0);

        return { categories, dataA, dataB, dataC, dataGeneral };
    };

    const { categories, dataA, dataB, dataC, dataGeneral } = prepareChartData();

    const chartOptions = {
        title: {
            text: 'Consumo por Sección y Consumo General'
        },
        xAxis: {
            categories: categories,
            title: {
                text: 'Meses'
            }
        },
        yAxis: {
            title: {
                text: 'Consumo M<sup>3</sup>', // Cambia esta línea
                useHTML: true // Asegúrate de que useHTML esté habilitado
            }
        },
        series: [
            {
                name: 'Sección A',
                data: dataA,
                color: '#7cb5ec' // Color para la Sección A
            },
            {
                name: 'Sección B',
                data: dataB,
                color: '#434348' // Color para la Sección B
            },
            {
                name: 'Sección C',
                data: dataC,
                color: '#90ed7d' // Color para la Sección C
            },
            {
                name: 'Consumo General',
                data: dataGeneral,
                color: '#f7a35c', // Color para el Consumo General
                dashStyle: 'ShortDash' // Estilo de línea para el consumo general
            }
        ],
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        }
    };

    // Función para descargar la tabla como archivo Excel
    const downloadExcel = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ['Meses', 'Consumo de Sección A', 'Consumo de Sección B', 'Consumo de Sección C', 'Consumo General'],
            ...meses.map(mes => [
                `${obtenerNombreMes(mes.substring(5, 7))} ${mes.substring(0, 4)}`,
                `${consumoData.A[mes] || 0} M³`,
                `${consumoData.B[mes] || 0} M³`,
                `${consumoData.C[mes] || 0} M³`,
                `${consumoData.general[mes] || 0} M³`
            ])
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
        XLSX.writeFile(wb, 'reportes_consumo.xlsx');
    };

    // Función para descargar el contenido en PDF
    const downloadPDF = () => {
        const input = document.getElementById('report-content');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save('reportes_consumo.pdf');
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
                <div className='text-center'>
                <Button 
                    onClick={downloadExcel} 
                    variant="success" 
                    className="mb-3 fw-bold" // fw-bold para hacer el texto en negritas
                >
                    <i className="fas fa-file"></i> DESCARGAR XML
                </Button>

                <Button 
                    onClick={downloadPDF} 
                    variant="danger" 
                    className="mb-3 ms-2 fw-bold" // fw-bold para hacer el texto en negritas
                >
                    <i className="fa-solid fa-file-pdf"></i> DESCARGAR PDF
                </Button>
            </div>

                <Container className="mt-4" id="report-content">
                <h2 className='text-center'>Reportes de consumo de M<sup>3</sup></h2>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Meses</th>
                                <th>Consumo de Sección A</th>
                                <th>Consumo de Sección B</th>
                                <th>Consumo de Sección C</th>
                                <th>Consumo General</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meses.map((mes, index) => (
                                <tr key={index}>
                                    <td>{obtenerNombreMes(mes.substring(5, 7))} {mes.substring(0, 4)}</td>
                                    <td>{consumoData.A[mes] || 0} M<sup>3</sup></td>
                                    <td>{consumoData.B[mes] || 0} M<sup>3</sup></td>
                                    <td>{consumoData.C[mes] || 0} M<sup>3</sup></td>
                                    <td>{consumoData.general[mes] || 0} M<sup>3</sup></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </Container>
            </div>
        </div>
    );
};

export default Reportes;
