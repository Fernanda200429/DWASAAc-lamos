<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    ObtenerFolios($conn);
} elseif ($method === 'PUT') {
    validarEstatus($conn);
} else {
    echo json_encode(['message' => 'Método no soportado']);
}

function ObtenerFolios($conn) {
    $sql = "SELECT c.Letra, c.Numero, r.Folio, r.Id_Recibo 
            FROM recibo r
            INNER JOIN casa c ON r.Id_Casa = c.Id_Casa
            WHERE r.estatus = 0 
              AND r.Folio IS NOT NULL 
              AND r.Folio != '' 
              AND r.Folio != '0'";
              
    $result = $conn->query($sql);

    $folios = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $folios[] = $row;
        }
    }

    echo json_encode(['folios' => $folios]);
}


function validarEstatus($conn) {
    $input = json_decode(file_get_contents('php://input'), true);
    $idRecibo = $input['Id_Recibo'] ?? null;

    if ($idRecibo) {
        $sql = "UPDATE recibo SET estatus = 1 WHERE Id_Recibo = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $idRecibo);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Estatus actualizado']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Id_Recibo no proporcionado']);
    }
}

$conn->close();
