<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include 'Conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Recibir los datos en formato JSON
$data = json_decode(file_get_contents("php://input"), true);
$Fecha = $data['fecha'] ?? null;
$Total_Recibo = $data['totalRecibo'] ?? 0;
$id = $data['id'] ?? null; // Obtener el ID para editar o eliminar

// Función para insertar los datos de recibo
function agregardatosDeCEA($conn, $Fecha, $Total_Recibo) {
    $sql = "INSERT INTO datosac (Fecha, Total_Recibo) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sd", $Fecha, $Total_Recibo); 

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Datos insertados correctamente.'];
    } else {
        return ['success' => false, 'message' => 'Error al insertar datos: ' . $stmt->error];
    }
}

// Función para editar los datos de recibo
function editardatosDeCEA($conn, $id, $Fecha, $Total_Recibo) {
    $sql = "UPDATE datosac SET Fecha=?, Total_Recibo=? WHERE ID=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdi", $Fecha, $Total_Recibo, $id); 

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Datos editados correctamente.'];
    } else {
        return ['success' => false, 'message' => 'Error al editar datos: ' . $stmt->error];
    }
}

// Función para eliminar los datos de recibo
function eliminardatosDeCEA($conn, $id) {
    $sql = "DELETE FROM datosac WHERE ID=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id); 

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Datos eliminados correctamente.'];
    } else {
        return ['success' => false, 'message' => 'Error al eliminar datos: ' . $stmt->error];
    }
}

$response = [];

// Si es una solicitud POST, intenta agregar el recibo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $Fecha) {
    $response = agregardatosDeCEA($conn, $Fecha, $Total_Recibo);
}

// Si es una solicitud PUT, intenta editar el recibo
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id) {
    $response = editardatosDeCEA($conn, $id, $Fecha, $Total_Recibo);
}

// Si es una solicitud DELETE, intenta eliminar el recibo
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
    $response = eliminardatosDeCEA($conn, $id);
}

// Obtener todos los recibos en orden descendente
$sql = "SELECT ID, Fecha, Total_Recibo FROM datosac ORDER BY Fecha DESC";
$result = $conn->query($sql);
$recibos = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $recibos[] = $row;
    }
}

$response['recibos'] = $recibos; // Agregar la lista de recibos al JSON
echo json_encode($response);

$conn->close();
?>
