<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
include 'Conexion.php';
/* Esta es la logica que quiero que implementes sigue mis instrucciones
A) Recibe un $idUsuario busca la casa y busca el recibo más reciente y busca todos los datos mas recientes el la rectura iteien una fecha la comparas con la que se parezca en el mes y año de la tabla datosac
B)Si recibes $idUsuario y $ID_Recibo Buscas y estraes todo los datos de esa casa 
Para lo siguiente haras estos calculos
Esta variable buscaras una lectura anterior y aqui se porndra el consumo de esa lectura anterior a la que se tiene ya sea más reciente o la anterior del recibo proporcionadao $Lectura_anterior
Esta variable  sera el consumo ya sea el más recinete o el de id lectura que se teiene del id recibo que recibiste $lectura_actual	
Para poder obtener este y enviarlo para recibos.js tienes que hacer la siguente operacion: $Canconsumo = $lectura_actual-$Lectura_anterior
Para ontener $ConsumoM haces lo siguiente: $ConsumoM =Total_pagar-53

 */
// Función para obtener todos los datos relevantes
function fetchAllData($conn, $idUsuario) {
    try {
        // Consulta SQL para obtener información de las tablas relacionadas
        $sql = "
            SELECT 
                c.Id_Casa, c.Letra, c.Numero, 
                u.ID as Id_Usuario, u.Nombre, u.Email,
                r.ID_Recibo, r.Monto, r.Fecha as Fecha_Recibo,
                l.ID_Lectura, l.Valor, l.Fecha as Fecha_Lectura
            FROM 
                casa c
            JOIN 
                usuario u ON c.id_usuario = u.ID
            LEFT JOIN 
                recibo r ON c.Id_Casa = r.ID_casa
            LEFT JOIN 
                lecturas l ON r.ID_Recibo = l.ID_Recibo
            WHERE 
                u.ID = ?
            ORDER BY 
                r.Fecha DESC, l.Fecha DESC;"; // Ordenar por fecha de recibo y lectura

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error en la preparación de la consulta: " . $conn->error);
        }
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        
        while ($row = $result->fetch_assoc()) {
            $data[] = [
                "idCasa" => $row["Id_Casa"],
                "letra" => $row["Letra"],
                "numero" => $row["Numero"],
                "idUsuario" => $row["Id_Usuario"],
                "Propietario" => $row["Propientario"],
                "recibo" => [
                    "id" => $row["ID_Recibo"],
                    "ID_Lectura" => $row["ID_Lectura"],
                    "Total_pagar" => $row["Total_pagar"]
                ],
                "lecturas" => [
                    "ID_Lectura" => $row["ID_Lectura"],
                    "iD_casa" => $row["ID_casa"],
                    "Consumo" => $row["Consumo"],
                    "fecha" => $row["Fecha"]
                ],
                "datosac" =>[
                    "Id" => $row["Id"],
                    "Fecha" => $row["Fecha"],
                    "Total_Recibo" => $row["Total_recibo"],
                ]
            ];
        }

        return $data;

    } catch (Exception $e) {
        http_response_code(500);
        return ["error" => $e->getMessage()];
    }
}

// Procesar la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['idUsuario'])) {
        $idUsuario = intval($_GET['idUsuario']);
        $data = fetchAllData($conn, $idUsuario);
        echo json_encode($data);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Parámetros inválidos.']);
    }
}

$conn->close();
?>
