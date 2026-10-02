<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';

if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

function obtenerDatosRecibo($idUsuario, $idRecibo = null, $conn) {
    $queryCasa = "SELECT Id_Casa, Propietario, Numero, Letra FROM casa WHERE id_usuario = ?";
    $stmtCasa = $conn->prepare($queryCasa);
    $stmtCasa->bind_param("i", $idUsuario);
    $stmtCasa->execute();
    $resultadoCasa = $stmtCasa->get_result();
    $casa = $resultadoCasa->fetch_assoc();

    if (!$casa) {
        return json_encode(["error" => "No se encontró la casa para el usuario proporcionado."]);
    }

    $idCasa = $casa['Id_Casa'];
    $lectura_anterior = 0;
    $lectura_actual = 0;
    $Canconsumo = 0;
    $ConsumoM = 0;
    $recibo = null;
    $fechaDatosAC = null;
    $fechaLectura = null;

    if ($idRecibo) {
        $queryRecibo = "SELECT * FROM recibo WHERE Id_Recibo = ? AND Id_Casa = ?";
        $stmtRecibo = $conn->prepare($queryRecibo);
        $stmtRecibo->bind_param("ii", $idRecibo, $idCasa);
        $stmtRecibo->execute();
        $resultadoRecibo = $stmtRecibo->get_result();
        $recibo = $resultadoRecibo->fetch_assoc();

        if (!$recibo) {
            return json_encode(["error" => "No se encontró el recibo con el ID proporcionado para esta casa."]);
        }

        $idLecturaActual = $recibo['ID_Lectura'];
        $queryLecturaActual = "SELECT Consumo, Fecha FROM lecturas WHERE ID_Lectura = ?";
        $stmtLecturaActual = $conn->prepare($queryLecturaActual);
        $stmtLecturaActual->bind_param("i", $idLecturaActual);
        $stmtLecturaActual->execute();
        $resultadoLecturaActual = $stmtLecturaActual->get_result();
        $lecturaActualData = $resultadoLecturaActual->fetch_assoc();
        $lectura_actual = $lecturaActualData['Consumo'];
        $fechaLectura = $lecturaActualData['Fecha'];

        $queryLecturaAnterior = "SELECT Consumo FROM lecturas WHERE ID_casa = ? AND Fecha < (SELECT Fecha FROM lecturas WHERE ID_Lectura = ?) ORDER BY Fecha DESC LIMIT 1";
        $stmtLecturaAnterior = $conn->prepare($queryLecturaAnterior);
        $stmtLecturaAnterior->bind_param("ii", $idCasa, $idLecturaActual);
        $stmtLecturaAnterior->execute();
        $resultadoLecturaAnterior = $stmtLecturaAnterior->get_result();
        $lecturaAnteriorData = $resultadoLecturaAnterior->fetch_assoc();
        $lectura_anterior = $lecturaAnteriorData['Consumo'];
    } else {
        $queryReciboReciente = "SELECT * FROM recibo WHERE Id_Casa = ? ORDER BY Id_Recibo DESC LIMIT 1";
        $stmtReciboReciente = $conn->prepare($queryReciboReciente);
        $stmtReciboReciente->bind_param("i", $idCasa);
        $stmtReciboReciente->execute();
        $resultadoReciboReciente = $stmtReciboReciente->get_result();
        $recibo = $resultadoReciboReciente->fetch_assoc();

        if ($recibo) {
            $idLecturaActual = $recibo['ID_Lectura'];
            $queryLecturaActual = "SELECT Consumo, Fecha FROM lecturas WHERE ID_Lectura = ?";
            $stmtLecturaActual = $conn->prepare($queryLecturaActual);
            $stmtLecturaActual->bind_param("i", $idLecturaActual);
            $stmtLecturaActual->execute();
            $resultadoLecturaActual = $stmtLecturaActual->get_result();
            $lecturaActualData = $resultadoLecturaActual->fetch_assoc();
            $lectura_actual = $lecturaActualData['Consumo'];
            $fechaLectura = $lecturaActualData['Fecha'];

            $queryLecturaAnterior = "SELECT Consumo FROM lecturas WHERE ID_casa = ? AND Fecha < (SELECT Fecha FROM lecturas WHERE ID_Lectura = ?) ORDER BY Fecha DESC LIMIT 1";
            $stmtLecturaAnterior = $conn->prepare($queryLecturaAnterior);
            $stmtLecturaAnterior->bind_param("ii", $idCasa, $idLecturaActual);
            $stmtLecturaAnterior->execute();
            $resultadoLecturaAnterior = $stmtLecturaAnterior->get_result();
            $lecturaAnteriorData = $resultadoLecturaAnterior->fetch_assoc();
            $lectura_anterior = $lecturaAnteriorData['Consumo'];
        } else {
            return json_encode(["error" => "No se encontró un recibo reciente para esta casa."]);
        }
    }

    $Canconsumo = $lectura_actual - $lectura_anterior;
    $ConsumoM = $recibo['Total_Pagar'] - 53;

    // Nueva consulta para obtener el Total_Recibo del mes y año de la lectura actual
    $queryTotalRecibo = "SELECT Total_Recibo FROM datosac WHERE MONTH(Fecha) = MONTH(?) AND YEAR(Fecha) = YEAR(?)";
    $stmtTotalRecibo = $conn->prepare($queryTotalRecibo);
    $stmtTotalRecibo->bind_param("ss", $fechaLectura, $fechaLectura);
    $stmtTotalRecibo->execute();
    $resultadoTotalRecibo = $stmtTotalRecibo->get_result();
    $totalReciboData = $resultadoTotalRecibo->fetch_assoc();
    $Total_Recibo = $totalReciboData ? $totalReciboData['Total_Recibo'] : null;

    $datos = [
        "Id_Casa" => $idCasa,
        "Numero" => $casa['Numero'],
        "Letra" => $casa['Letra'],
        "Propietario" => $casa['Propietario'],
        "Lectura_Anterior" => $lectura_anterior,
        "Lectura_Actual" => $lectura_actual,
        "Canconsumo" => $Canconsumo,
        "ConsumoM" => $ConsumoM,
        "Total_Pagar" => $recibo['Total_Pagar'],
        "Folio" => $recibo['Folio'],
        "Fecha_Lectura" => $fechaLectura,
        "Total_Recibo" => $Total_Recibo
    ];

    return json_encode($datos);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['idUsuario'])) {
        $idUsuario = intval($_GET['idUsuario']);
        $idRecibo = isset($_GET['idRecibo']) ? intval($_GET['idRecibo']) : null;
        $data = obtenerDatosRecibo($idUsuario, $idRecibo, $conn);
        echo $data;
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Parámetros inválidos.']);
    }
}

$conn->close();
?>
