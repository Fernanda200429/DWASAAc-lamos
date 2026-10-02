<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';
function fetchCasas($conn) {
    // Consultar las casas desde la base de datos
    $sql = "SELECT Id_Casa, Letra, Numero FROM casa";
    $result = $conn->query($sql);

    // Comprobar si se encontraron resultados
    if ($result->num_rows > 0) {
        $casas = [];

        // Recorrer los resultados y agregarlos al array
        while ($row = $result->fetch_assoc()) {
            $casas[] = [
                "id" => $row["Id_Casa"],
                "letra" => $row["Letra"],
                "numero" => $row["Numero"],
                "id_usuario" => $row["id_usuario"]
            ];
        }

        return json_encode($casas); // Devolver resultados como JSON
    } else {
        return json_encode([]); // Si no hay resultados, devolver un array vacío
    }
}


function obtenerLecturas($conn) {
    $sql = "SELECT * FROM lecturas";
    $result = $conn->query($sql);

    $lecturas = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $lecturas[] = $row;
        }
    }
    echo json_encode($lecturas);
}

function agregarLectura($conn, $idCasa, $fecha, $consumo) {
    $sql = "INSERT INTO lecturas (ID_casa, Fecha, Consumo) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $idCasa, $fecha, $consumo);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Lectura agregada correctamente."]);
    } else {
        echo json_encode(["error" => "Error al agregar lectura: " . $stmt->error]);
    }
}

function editarLectura($conn, $idLectura, $idCasa, $fecha, $consumo) {
    // Actualizar la lectura
    $sql = "UPDATE lecturas SET ID_casa = ?, Fecha = ?, Consumo = ? WHERE ID_Lectura = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isdi", $idCasa, $fecha, $consumo, $idLectura);

    if ($stmt->execute()) {
        // Si la actualización de la lectura fue exitosa, recalcular el total a pagar
        $response = actualizarTotalRecibo($conn, $idLectura);
        if ($response) {
            echo json_encode(["message" => "Lectura editada correctamente y total del recibo actualizado."]);
        } else {
            echo json_encode(["error" => "Error al actualizar el recibo."]);
        }
    } else {
        echo json_encode(["error" => "Error al editar lectura: " . $stmt->error]);
    }
}

function actualizarTotalRecibo($conn, $idLectura) {
    // Consultar la lectura actual
    $sqlActual = "SELECT ID_casa, Consumo, Fecha FROM lecturas WHERE ID_Lectura = ?";
    $stmtActual = $conn->prepare($sqlActual);
    $stmtActual->bind_param("i", $idLectura);
    $stmtActual->execute();
    $resultadoActual = $stmtActual->get_result();

    if ($resultadoActual->num_rows > 0) {
        $lecturaActual = $resultadoActual->fetch_assoc();
        $idCasa = $lecturaActual['ID_casa'];
        $consumoActual = (float)$lecturaActual['Consumo']; // Asegurarse de que sea float
        $fechaActual = $lecturaActual['Fecha'];

        // Consultar la lectura anterior de la misma casa
        $sqlAnterior = "SELECT Consumo FROM lecturas WHERE ID_casa = ? AND Fecha < ? ORDER BY Fecha DESC LIMIT 1";
        $stmtAnterior = $conn->prepare($sqlAnterior);
        $stmtAnterior->bind_param("is", $idCasa, $fechaActual);
        $stmtAnterior->execute();
        $resultadoAnterior = $stmtAnterior->get_result();

        if ($resultadoAnterior->num_rows > 0) {
            $lecturaAnterior = $resultadoAnterior->fetch_assoc();
            $consumoAnterior = (float)$lecturaAnterior['Consumo']; // Asegurarse de que sea float

            // Calcular el total a pagar
            $totalPagar = ($consumoActual - $consumoAnterior) * 45 + 53;

            // Actualizar el recibo existente
            return actualizarRecibo($conn, $idLectura, $totalPagar);
        } else {
            // Si no hay lectura anterior (posiblemente la primera lectura), el consumo se toma directamente
            $totalPagar = ($consumoActual) * 45 + 53;

            // Actualizar el recibo con este cálculo
            return actualizarRecibo($conn, $idLectura, $totalPagar);
        }
    } else {
        return false;
    }
}

function actualizarRecibo($conn, $idLectura, $totalPagar) {
    // Actualizar el recibo para la lectura específica
    $sqlRecibo = "UPDATE recibo SET Total_Pagar = ? WHERE ID_Lectura = ?";
    $stmtRecibo = $conn->prepare($sqlRecibo);
    $stmtRecibo->bind_param("di", $totalPagar, $idLectura);
    
    return $stmtRecibo->execute(); // Retorna true si la actualización fue exitosa
}


function eliminarLectura($conn, $idLectura) {
    $sql = "DELETE FROM lecturas WHERE ID_Lectura = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idLectura);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Lectura eliminada correctamente."]);
    } else {
        echo json_encode(["error" => "Error al eliminar lectura: " . $stmt->error]);
    }
}

// Manejo de solicitudes HTTP
$requestMethod = $_SERVER['REQUEST_METHOD'];

if ($requestMethod == 'OPTIONS') {
    // Enviar respuesta para solicitudes preflight
    http_response_code(200);
    exit();
}

switch ($requestMethod) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'fetchCasas') {
            echo fetchCasas($conn);  // Asegúrate de devolver los resultados correctamente
        } else {
            obtenerLecturas($conn);  // Obtener lecturas por defecto
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['idCasa'], $data['fecha'], $data['consumo'])) {
            $idCasa = $data['idCasa'];
            $fecha = $data['fecha'];
            $consumo = $data['consumo'];
            agregarLectura($conn, $idCasa, $fecha, $consumo);
        } else {
            echo json_encode(["error" => "Datos incompletos para agregar lectura."]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['ID_Lectura'], $data['idCasa'], $data['fecha'], $data['consumo'])) {
            $idLectura = $data['ID_Lectura'];
            $idCasa = $data['idCasa'];
            $fecha = $data['fecha'];
            $consumo = $data['consumo'];
            editarLectura($conn, $idLectura, $idCasa, $fecha, $consumo);
        } else {
            echo json_encode(["error" => "Datos incompletos para editar lectura."]);
        }
        break;

        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['ID_Lectura'])) {
                $idLectura = $data['ID_Lectura'];
                eliminarLectura($conn, $idLectura);
            } else {
                echo json_encode(["error" => "ID de lectura no proporcionado para eliminar."]);
            }
            break;
         

    default:
        echo json_encode(["error" => "Método no permitido"]);
        break;
}


$conn->close();
?>