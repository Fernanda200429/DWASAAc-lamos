import React, { useState, useEffect } from 'react';
import { Container, Button, Image, Form } from 'react-bootstrap';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Panel.css';
import NavBar from './NavBar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportesCF = () => {
    const [userType, setUserType] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [consumoData, setConsumoData] = useState({ A: {}, B: {}, C: {}, general: {} });
    const [seccion, setSeccion] = useState('A'); // Sección por defecto

    useEffect(() => {
        const storedUserType = localStorage.getItem('user_type');
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        const storedProfilePicture = localStorage.getItem('profile_picture');

        if (storedUserType) setUserType(parseInt(storedUserType, 10));
        if (storedUsername) setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
        if (storedProfilePicture) setProfilePicture(storedProfilePicture);

        fetchConsumptionData();
    }, [seccion]);

    const fetchConsumptionData = () => {
        const payload = { seccion };

        fetch('http://localhost/DWASAAcÁlamos/Back/Reportes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
    };

    const meses = Object.keys(consumoData[seccion] || {});

    const obtenerNombreMes = (mesNumero) => {
        const mesesNombres = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril', '05': 'Mayo',
            '06': 'Junio', '07': 'Julio', '08': 'Agosto', '09': 'Septiembre', 
            '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };
        return mesesNombres[mesNumero] || mesNumero;
    };

    const downloadExcel = () => {
        const ws = XLSX.utils.aoa_to_sheet([
            ['Meses', `Consumo de Sección ${seccion}`, 'Consumo General'],
            ...meses.map(mes => [
                `${obtenerNombreMes(mes.substring(5, 7))} ${mes.substring(0, 4)}`,
                `${consumoData[seccion][mes] || 0} M³`,
                `${consumoData.general[mes] || 0} M³`
            ])
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
        XLSX.writeFile(wb, 'reportes_consumo.xlsx');
    };

    const downloadPDF = () => {
        const input = document.getElementById('report-content');
        
        html2canvas(input).then(async (canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

            // Captura las gráficas una por una y las añade al PDF
            const chartIds = ['line-chart', 'bar-chart', 'pie-chart'];
            let yPosition = imgHeight + 20; // Posición vertical en el PDF para cada gráfica
            
            for (let chartId of chartIds) {
                const chartElement = document.getElementById(chartId);
                if (chartElement) {
                    const chartCanvas = await html2canvas(chartElement);
                    const chartImgData = chartCanvas.toDataURL('image/png');
                    const chartImgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
                    pdf.addImage(chartImgData, 'PNG', 10, yPosition, imgWidth, chartImgHeight);
                    yPosition += chartImgHeight + 10; // Incrementar la posición para la siguiente gráfica
                }
            }

            pdf.save('reportes_consumo.pdf');
        });
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
    // Configuración de gráficos
    const lineChartOptions = {
        title: { text: `Consumo de Agua - Sección ${seccion}` },
        xAxis: { categories: meses.map(mes => obtenerNombreMes(mes.substring(5, 7))) },
        series: [{
            name: `Consumo de Sección ${seccion}`,
            data: meses.map(mes => consumoData[seccion][mes] || 0)
        }]
    };

    const barChartOptions = {
        chart: { type: 'column' },
        title: { text: `Consumo de Agua - Sección ${seccion}` },
        xAxis: { categories: meses.map(mes => obtenerNombreMes(mes.substring(5, 7))) },
        series: [{
            name: `Consumo de Sección ${seccion}`,
            data: meses.map(mes => consumoData[seccion][mes] || 0)
        }]
    };

    const pieChartOptions = {
        chart: { type: 'pie' },
        title: { text: `Distribución del Consumo - Sección ${seccion}` },
        series: [{
            name: 'Consumo',
            colorByPoint: true,
            data: meses.map(mes => ({
                name: obtenerNombreMes(mes.substring(5, 7)),
                y: consumoData[seccion][mes] || 0
            }))
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
                    <h2 className="text-center">Reportes de Consumo de Agua por Sección</h2>

                    <Form className="mb-4">
                        <Form.Group controlId="formSection">
                            <Form.Label>Sección</Form.Label>
                            <Form.Select value={seccion} onChange={(e) => setSeccion(e.target.value)}>
                                <option value="A">Sección A</option>
                                <option value="B">Sección B</option>
                                <option value="C">Sección C</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>

                    <div className="text-center">
                        <Button onClick={downloadExcel} variant="success" className="mb-3 fw-bold">
                            <i className="fas fa-file"></i> DESCARGAR XML
                        </Button>
                        <Button onClick={downloadPDF} variant="danger" className="mb-3 ms-2 fw-bold">
                            <i className="fa-solid fa-file-pdf"></i> DESCARGAR PDF
                        </Button>
                    </div>

                    <table className="table table-striped" id="report-content">
                        <thead>
                            <tr>
                                <th>Meses</th>
                                <th>Consumo de Sección {seccion}</th>
                                <th>Consumo General</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meses.map((mes) => (
                                <tr key={mes}>
                                    <td>{`${obtenerNombreMes(mes.substring(5, 7))} ${mes.substring(0, 4)}`}</td>
                                    <td>{consumoData[seccion][mes] || 0} M³</td>
                                    <td>{consumoData.general[mes] || 0} M³</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="chart-container" id="line-chart">
                        <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
                    </div>

                    <div className="chart-container" id="bar-chart">
                        <HighchartsReact highcharts={Highcharts} options={barChartOptions} />
                    </div>

                    <div className="chart-container" id="pie-chart">
                        <HighchartsReact highcharts={Highcharts} options={pieChartOptions} />
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default ReportesCF;
