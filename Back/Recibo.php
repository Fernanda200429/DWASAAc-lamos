<?php
header('Access-Control-Allow-Origin: http://localhost:3000'); // Permitir el acceso desde el frontend
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include 'Conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function validarCasa($conn, $idCasa) {
    $sql = "SELECT Id_Casa FROM casa WHERE Id_Casa = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $idCasa);
    $stmt->execute();
    $resultado = $stmt->get_result();
    return $resultado->num_rows > 0;
}

function agregarLectura($conn, $idCasa, $fecha, $consumo) {
    // Validar que ID_casa existe
    if (!validarCasa($conn, $idCasa)) {
        return json_encode(["error" => "ID_casa no válido."]);
    }

    // Extraer mes y año de la fecha
    $mesAnio = date('Y-m', strtotime($fecha));

    // Consultar la tabla DatosAC con el mismo mes y año
    $sqlDatosAC = "SELECT ID FROM DatosAC WHERE DATE_FORMAT(Fecha, '%Y-%m') = ?";
    $stmtDatosAC = $conn->prepare($sqlDatosAC);
    $stmtDatosAC->bind_param("s", $mesAnio);
    $stmtDatosAC->execute();
    $resultadoDatosAC = $stmtDatosAC->get_result();

    if ($resultadoDatosAC->num_rows > 0) {
        $datosAC = $resultadoDatosAC->fetch_assoc();
        $idDatosAC = $datosAC['ID']; // Obtener el ID de DatosAC

        // Insertar la lectura
        $sql = "INSERT INTO lecturas (ID_casa, Fecha, Consumo) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isd", $idCasa, $fecha, $consumo);

        if ($stmt->execute()) {
            $lastInsertId = $stmt->insert_id;
            // Calcular el total a pagar
            return calcularTotalPagar($conn, $lastInsertId, $idDatosAC);
        } else {
            return json_encode(["error" => "Error al agregar lectura: " . $stmt->error]);
        }
    } else {
        return json_encode(["error" => "No se encontró un registro con la fecha especificada en DatosAC."]);
    }
}

function calcularTotalPagar($conn, $idLectura, $idDatosAC) {
    // Consultar la lectura actual
    $sqlActual = "SELECT ID_casa, Consumo, Fecha FROM lecturas WHERE ID_Lectura = ?";
    $stmtActual = $conn->prepare($sqlActual);
    $stmtActual->bind_param("i", $idLectura);
    $stmtActual->execute();
    $resultadoActual = $stmtActual->get_result();

    if ($resultadoActual->num_rows > 0) {
        $lecturaActual = $resultadoActual->fetch_assoc();
        $idCasa = $lecturaActual['ID_casa'];
        $consumoActual = $lecturaActual['Consumo'];
        $fechaActual = $lecturaActual['Fecha'];

        // Consultar la lectura anterior de la misma casa
        $sqlAnterior = "SELECT Consumo FROM lecturas WHERE ID_casa = ? AND Fecha < ? ORDER BY Fecha DESC LIMIT 1";
        $stmtAnterior = $conn->prepare($sqlAnterior);
        $stmtAnterior->bind_param("is", $idCasa, $fechaActual);
        $stmtAnterior->execute();
        $resultadoAnterior = $stmtAnterior->get_result();

        if ($resultadoAnterior->num_rows > 0) {
            $lecturaAnterior = $resultadoAnterior->fetch_assoc();
            $consumoAnterior = $lecturaAnterior['Consumo'];

            // Calcular el total a pagar
            $totalPagar = ($consumoActual - $consumoAnterior) * 45 + 53;

            // Insertar los datos en la tabla recibo
            $insertRecibo = insertarRecibo($conn, $idLectura, $idCasa, $idDatosAC, $totalPagar);
            if ($insertRecibo) {
                return json_encode([
                    // Estos datos son los que quiero que se inserten en recibo
                    "ID_Lectura" => $idLectura,
                    "ID_Casa" => $idCasa,
                    "Total_Pagar" => $totalPagar
                ]);
            } else {
                return json_encode(["error" => "Error al insertar en la tabla recibo."]);
            }
        } else {
            return json_encode(["error" => "No se encontró una lectura anterior para esta casa."]);
        }
    } else {
        return json_encode(["error" => "No se encontró la lectura actual."]);
    }
}

function insertarRecibo($conn, $idLectura, $idCasa, $idDatosAC, $totalPagar) {
    $sqlRecibo = "INSERT INTO recibo (ID_Lectura, ID_Casa, ID_DatosAC, Total_Pagar) VALUES (?, ?, ?, ?)";
    $stmtRecibo = $conn->prepare($sqlRecibo);
    $stmtRecibo->bind_param("iiid", $idLectura, $idCasa, $idDatosAC, $totalPagar);
    
    return $stmtRecibo->execute(); // Retorna true si la inserción fue exitosa
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['idCasa']) && isset($data['fecha']) && isset($data['consumo'])) {
        $idCasa = $data['idCasa'];
        $fecha = $data['fecha'];
        $consumo = $data['consumo'];
        $response = agregarLectura($conn, $idCasa, $fecha, $consumo);
        echo $response; // Enviar la respuesta al cliente
    } else {
        echo json_encode(["error" => "Datos de lectura no proporcionados."]);
    }
}


// Cerrar la conexión
$conn->close();
?>
