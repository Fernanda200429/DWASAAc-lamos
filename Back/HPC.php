<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';

// Verificar la conexión a la base de datos
if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// Función para obtener la casa del usuario
function fetchCasaByUser($conn, $idUsuario) {
    try {
        // Suponiendo que la tabla usuario tiene el Id_Casa
        $sql = "SELECT c.Id_Casa, c.Letra, c.Numero
                FROM casa c
                JOIN usuario u ON c.id_usuario = u.ID
                WHERE u.ID = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            throw new Exception("Error preparando la consulta: " . $conn->error);
        }
        $stmt->bind_param("i", $idUsuario);
        if (!$stmt->execute()) {
            throw new Exception("Error ejecutando la consulta: " . $stmt->error);
        }
        $result = $stmt->get_result();
        
        $casas = [];
        while ($row = $result->fetch_assoc()) {
            $casas[] = [
                "id" => $row["Id_Casa"],
                "letra" => $row["Letra"],
                "numero" => $row["Numero"]
            ];
        }
        return $casas;
    } catch (Exception $e) {
        return ["error" => $e->getMessage()];
    }
}

// Función para obtener lecturas por ID de casa
function fetchLecturas($conn, $idCasa) {
    try {
        $sql = "SELECT * FROM lecturas WHERE ID_casa = ?"; // Corregido el nombre de columna
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            throw new Exception("Error preparando la consulta: " . $conn->error);
        }
        $stmt->bind_param("i", $idCasa);
        if (!$stmt->execute()) {
            throw new Exception("Error ejecutando la consulta: " . $stmt->error);
        }
        $result = $stmt->get_result();

        $lecturas = [];
        while ($row = $result->fetch_assoc()) {
            $lecturas[] = $row;
        }
        return $lecturas;
    } catch (Exception $e) {
        return ["error" => $e->getMessage()];
    }
}

// Manejo de solicitudes HTTP
$requestMethod = $_SERVER['REQUEST_METHOD'];

if ($requestMethod == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    
    switch ($action) {
        case 'fetchCasaByUser':
            if (isset($_GET['idUsuario'])) {
                $idUsuario = intval($_GET['idUsuario']);
                $casas = fetchCasaByUser($conn, $idUsuario);
                echo json_encode($casas);
            } else {
                echo json_encode(["error" => "ID de usuario no proporcionado."]);
            }
            break;

        case 'fetchLecturas':
            if (isset($_GET['idCasa'])) {
                $idCasa = intval($_GET['idCasa']);
                $lecturas = fetchLecturas($conn, $idCasa);
                echo json_encode($lecturas);
            } else {
                echo json_encode(["error" => "ID de casa no proporcionado."]);
            }
            break;

        default:
            echo json_encode(["error" => "Acción no reconocida."]);
            break;
    }
} else {
    echo json_encode(["error" => "Acción no especificada."]);
}

$conn->close();
