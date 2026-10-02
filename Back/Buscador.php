<?php
// Incluye tu archivo de conexión a la base de datos
include 'Conexion.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verifica si se ha recibido la acción
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'fetchIdCasa':
        $Letra = $_GET['Letra'] ?? '';
        $Numero = $_GET['Numero'] ?? '';

        if (empty($Letra) || empty($Numero)) {
            echo json_encode(['error' => 'Letra y Número son obligatorios']);
            exit;
        }

        $stmt = $conn->prepare("SELECT ID_casa FROM casa WHERE Letra = ? AND Numero = ? LIMIT 1");
        if ($stmt === false) {
            echo json_encode(['error' => 'Error en la preparación de la consulta']);
            exit;
        }

        $stmt->bind_param("ss", $Letra, $Numero);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $idCasa = $row['ID_casa'];
            echo json_encode(['idCasa' => [$row]]); // Retornar ID_casa en un array
        } else {
            echo json_encode(['idCasa' => []]);
        }

        $stmt->close();
        break;

    case 'fetchLecturas':
        $idCasa = $_GET['idCasa'] ?? null;

        if (is_null($idCasa)) {
            echo json_encode(['error' => 'ID de casa es obligatorio']);
            exit;
        }

        $stmt = $conn->prepare("SELECT * FROM lecturas WHERE ID_casa = ? ORDER BY Fecha DESC");
        if ($stmt === false) {
            echo json_encode(['error' => 'Error en la preparación de la consulta']);
            exit;
        }

        $stmt->bind_param("i", $idCasa);
        $stmt->execute();
        $result = $stmt->get_result();

        $lecturas = [];
        while ($row = $result->fetch_assoc()) {
            $lecturas[] = $row;
        }

        echo json_encode($lecturas);
        $stmt->close();
        break;

    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

// Cierra la conexión
$conn->close();
?>
