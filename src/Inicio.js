import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirección
import './inicio.css'; // Importa el archivo de estilos para el componente

const Inicio = () => {
  const navigate = useNavigate(); // Crea una instancia del hook useNavigate

  const handleLoginClick = () => {
    navigate('/'); // Redirige al componente App
  };

  return (
    <header className="custom-pink-bg">
      <div className="overlay">
        <h1>Bienvenido Condominio </h1>
        <p></p>
        <button className="login-button" onClick={handleLoginClick}>
          Iniciar Sesión
        </button>
      </div>
    </header>
  );
};

export default Inicio;
