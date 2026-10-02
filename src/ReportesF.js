import React, { useState, useEffect } from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css'; // Asegúrate de incluir estilos personalizados
import NavBar from './NavBar';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as XLSX from 'xlsx'; // Para exportar a Excel
import jsPDF from 'jspdf'; // Para exportar a PDF
import html2canvas from 'html2canvas';

const ReportesF = () => {
    const [userType, setUserType] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [consumoData, setConsumoData] = useState({ A: {}, B: {}, C: {}, general: {} });
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [filteredMeses, setFilteredMeses] = useState([]);

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
                setFilteredMeses(Object.keys(data.consumoPorMes.A || {}));
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
    const formatFecha = (fecha) => {
        const mesNumero = fecha.substring(5, 7);
        const anio = fecha.substring(0, 4);
        return `${obtenerNombreMes(mesNumero)} ${anio}`;
    };

    const handleFilter = () => {
        const filtered = meses.filter(mes => {
            const fechaMes = new Date(mes);
            const fechaInicioObj = new Date(fechaInicio);
            const fechaFinObj = new Date(fechaFin);
            return (!fechaInicio || fechaMes >= fechaInicioObj) && (!fechaFin || fechaMes <= fechaFinObj);
        });
        setFilteredMeses(filtered);
    };

    const prepareChartData = () => {
        const categories = filteredMeses.map(mes => {
            const mesNumero = mes.substring(5, 7);
            return obtenerNombreMes(mesNumero) + ' ' + mes.substring(0, 4);
        });

        const dataA = filteredMeses.map(mes => consumoData.A[mes] || 0);
        const dataB = filteredMeses.map(mes => consumoData.B[mes] || 0);
        const dataC = filteredMeses.map(mes => consumoData.C[mes] || 0);
        const dataGeneral = filteredMeses.map(mes => consumoData.general[mes] || 0);

        return { categories, dataA, dataB, dataC, dataGeneral };
    };

    const { categories, dataA, dataB, dataC, dataGeneral } = prepareChartData();

    const chartOptions = {
        chart: {
            type: 'column'
        },
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
                text: 'Consumo M<sup>3</sup>',
                useHTML: true
            }
        },
        series: [
            {
                name: 'Sección A',
                data: dataA,
                color: '#7cb5ec'
            },
            {
                name: 'Sección B',
                data: dataB,
                color: '#434348'
            },
            {
                name: 'Sección C',
                data: dataC,
                color: '#90ed7d'
            },
            {
                name: 'Consumo General',
                data: dataGeneral,
                color: '#f7a35c',
                dashStyle: 'ShortDash'
            }
        ],
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            column: {
                stacking: false,  // Cambiado de 'normal' a 'false'
                dataLabels: {
                    enabled: true
                }
            }
        }
    };
    const formatFechas = (fecha) => {
        const [anio, mesNumero, dia] = fecha.split('-');
        return `${dia} de ${obtenerNombreMes(mesNumero)} del ${anio}`;
    };

    const downloadExcel = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ['Meses', 'Consumo de Sección A', 'Consumo de Sección B', 'Consumo de Sección C', 'Consumo General'],
            ...filteredMeses.map(mes => [
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
        <div className="reportesF">
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
                                    <h2 className="mb-0">{username}</h2>
                                    <h6 className="text-muted">{email}</h6>
                                </div>
                            </div>
                            <Button variant="danger" onClick={handleLogout}>Cerrar sesión</Button>
                        </div>
                    </Container>
                </header>
                <div className="text-center">
                        <Button onClick={downloadExcel} variant="success" className="mb-3 fw-bold">
                            <i className="fas fa-file"></i> DESCARGAR XML
                        </Button>
                        <Button onClick={downloadPDF} variant="danger" className="mb-3 ms-2 fw-bold">
                            <i className="fa-solid fa-file-pdf"></i> DESCARGAR PDF
                        </Button>
                    </div>
                <div className="filter-section mb-4">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="form-control me-2"
                            placeholder="Fecha Inicio"
                        />
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="form-control me-2"
                            placeholder="Fecha Fin"
                        />
                        <Button variant="primary" onClick={handleFilter}>Filtrar</Button>
                    </div>
                <Container className="mt-4" id="report-content">                  
                    {/* Aquí se añade el texto del reporte */}
                    {fechaInicio && fechaFin && (
                    <h3 className="text-center mb-4">
                        Reporte de la fecha {formatFechas(fechaInicio)} a {formatFechas(fechaFin)}
                    </h3>
                )}
                    <div className="table-responsive mt-4">
                       <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Consumo A (M³)</th>
                                    <th>Consumo B (M³)</th>
                                    <th>Consumo C (M³)</th>
                                    <th>Consumo General (M³)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMeses.map(mes => (
                                    <tr key={mes}>
                                        <td>{`${obtenerNombreMes(mes.substring(5, 7))} ${mes.substring(0, 4)}`}</td>
                                        <td>{consumoData.A[mes] || 0}</td>
                                        <td>{consumoData.B[mes] || 0}</td>
                                        <td>{consumoData.C[mes] || 0}</td>
                                        <td>{consumoData.general[mes] || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    <div className="chart-section">
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={chartOptions}
                        />
                    </div>
                </Container>
            </div>
        </div>
    );
    
};

export default ReportesF;
