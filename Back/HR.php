<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decodifica el JSON recibido desde React
    $data = json_decode(file_get_contents('php://input'), true);

    // Verifica si se trata de agregar un folio
    if (isset($data['folio']) && isset($data['id_recibo'])) {
        $folio = $data['folio'];
        $id_recibo = $data['id_recibo'];

        // Actualiza la tabla recibo con el nuevo folio
        $sqlUpdateFolio = "UPDATE recibo SET folio = ? WHERE Id_Recibo = ?";
        $stmtUpdateFolio = $conn->prepare($sqlUpdateFolio);
        $stmtUpdateFolio->bind_param('si', $folio, $id_recibo);

        if ($stmtUpdateFolio->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Folio guardado correctamente.'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al guardar el folio.'
            ]);
        }

        $stmtUpdateFolio->close();
    } 
    // Si no es para agregar un folio, ejecuta la lógica original
    else if (isset($data['id_usuario'])) {
        $id_usuario = $data['id_usuario'];

        // Consulta en la tabla casa para obtener el ID de la casa correspondiente al usuario
        $sqlCasa = "SELECT id_casa FROM casa WHERE id_usuario = ?";
        $stmtCasa = $conn->prepare($sqlCasa);
        $stmtCasa->bind_param('i', $id_usuario); // 'i' significa integer
        $stmtCasa->execute();
        $resultCasa = $stmtCasa->get_result();

        if ($resultCasa->num_rows > 0) {
            $rowCasa = $resultCasa->fetch_assoc();
            $id_casa = $rowCasa['id_casa'];

            // Consulta en la tabla recibo para obtener los recibos asociados a la casa
            // y la fecha correspondiente de la tabla lecturas
            $sqlRecibo = "
                SELECT r.*, l.fecha 
                FROM recibo r
                JOIN lecturas l ON r.id_lectura = l.id_lectura
                WHERE r.id_casa = ?
            ";
            $stmtRecibo = $conn->prepare($sqlRecibo);
            $stmtRecibo->bind_param('i', $id_casa);
            $stmtRecibo->execute();
            $resultRecibo = $stmtRecibo->get_result();

            if ($resultRecibo->num_rows > 0) {
                $recibos = [];
                while ($rowRecibo = $resultRecibo->fetch_assoc()) {
                    $recibos[] = $rowRecibo;
                }

                // Enviar los recibos al frontend en formato JSON
                echo json_encode([
                    'status' => 'success',
                    'recibos' => $recibos
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No se encontraron recibos para esta casa.'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'No se encontró una casa asociada a este usuario.'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'ID de usuario no proporcionado.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Método HTTP no soportado.'
    ]);
}

$conn->close();
?>
