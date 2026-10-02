<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';

// Verificar la conexión a la base de datos
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// Función para obtener la casa del usuario
function fetchCasaByUser($conn, $idUsuario) {
    try {
        $sql = "SELECT c.Id_Casa, c.Letra, c.Numero
                FROM casa c
                JOIN usuario u ON c.id_usuario = u.ID
                WHERE u.ID = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conn->error);
        }
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            return [
                "idCasa" => $row["Id_Casa"],
                "letra" => $row["Letra"],
                "numero" => $row["Numero"]
            ];
        } else {
            http_response_code(404);
            return ["error" => "No se encontró una casa para este usuario."];
        }
    } catch (Exception $e) {
        http_response_code(500);
        return ["error" => $e->getMessage()];
    }
}

// Función para obtener recibos por ID de casa
function fetchRecibosByCasa($conn, $idCasa) {
    try {
        $sql = "SELECT * FROM recibo WHERE ID_casa = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conn->error);
        }
        $stmt->bind_param("i", $idCasa);
        $stmt->execute();
        $result = $stmt->get_result();
        $recibos = $result->fetch_all(MYSQLI_ASSOC);
        return $recibos;
    } catch (Exception $e) {
        http_response_code(500);
        return ["error" => $e->getMessage()];
    }
}

// Función para guardar el folio en el recibo
function guardarFolio($conn, $folio, $lecturaId) {
    try {
        $sql = "UPDATE recibo SET folio = ? WHERE ID_Lectura = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conn->error);
        }
        $stmt->bind_param("si", $folio, $lecturaId);
        
        if ($stmt->execute()) {
            return ["success" => true];
        } else {
            return ["success" => false, "error" => "No se pudo guardar el folio."];
        }
    } catch (Exception $e) {
        http_response_code(500);
        return ["error" => $e->getMessage()];
    }
}

// Procesar la solicitud
$action = $_GET['action'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['idUsuario'])) {
        $idUsuario = intval($_GET['idUsuario']);
        $casa = fetchCasaByUser($conn, $idUsuario);
        $recibos = fetchRecibosByCasa($conn, $casa['idCasa'] ?? 0);
        
        echo json_encode(['casa' => $casa, 'recibos' => $recibos]);
    } elseif ($action === 'fetchLecturas' && isset($_GET['idCasa'])) {
        $idCasa = intval($_GET['idCasa']);
        $recibos = fetchRecibosByCasa($conn, $idCasa);
        echo json_encode($recibos);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Parámetros inválidos.']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'guardarFolio') {
    $data = json_decode(file_get_contents("php://input"), true);
    $folio = $data['folio'] ?? null;
    $lecturaId = $data['lecturaId'] ?? null;

    if ($folio !== null && $lecturaId !== null) {
        $response = guardarFolio($conn, $folio, $lecturaId);
        echo json_encode($response);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan parámetros para guardar el folio.']);
    }
}

$conn->close();
?>
