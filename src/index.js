import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Panel from './Panel';
import Inicio from './Inicio';
import Usuarios from './Usuarios';
import NavBar from './NavBar';
import LecturasN from './LecturasN';
import HistoricoLec from './HistoricoLec';
import Recibos from './Recibos';
import HRP from './HRP';
import HR from './HR';
import GraficasAdmin from './GraficasAdmin';
import Inforecibos from './Inforecibos';
import Reportes from './Reportes';
import ReportesCF from './ReportesCF';
import ReportesF from './ReportesF';
import Propietarios from './Propietarios';
import Folios from './Folios';
import HistR from './HistR';

import './index.css'; // Asegúrate de que todos los estilos estén aquí
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId='567116455210-dddjooccef0bmp8d75cf397c696d6bis.apps.googleusercontent.com'>
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/Panel" element={<Panel />} /> 
          <Route path="/Inicio" element={<Inicio />} />
          <Route path='/Usuarios' element={<Usuarios/>}/>
          <Route path='/NavBar' element={<NavBar/>}/>
          <Route path='/LecturasN' element={<LecturasN/>}/>
          <Route path='/HistoricoLec' element={<HistoricoLec/>}/>
          <Route path='/Recibos' element={<Recibos/>}/>
          <Route path='/HRP' element={<HRP/>}/>
          <Route path='/HR' element={<HR/>}/>
          <Route path='/Inforecibos' element={<Inforecibos/>}/>
          <Route path='/GraficasAdmin' element={<GraficasAdmin/>}/>
          <Route path='/Reportes' element={<Reportes/>}/>
          <Route path='/ReportesCF' element={<ReportesCF/>}/>
          <Route path='/ReportesF' element={<ReportesF/>}/>
          <Route path='/Propietarios' element={<Propietarios/>}/>
          <Route path='/Folios' element={<Folios/>}/>
          <Route path='/HistR' element={<HistR/>}/>
        </Routes>
      </Router>
    </React.StrictMode>
  </GoogleOAuthProvider>
);

reportWebVitals();
