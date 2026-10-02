<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

include 'Conexion.php';

$sql = "
    SELECT c.id_casa, r.Total_Pagar, l.fecha
    FROM casa c
    JOIN recibo r ON c.id_casa = r.id_casa
    JOIN lecturas l ON r.id_lectura = l.id_lectura
";
$result = $conn->query($sql);

$consumoPorMes = [
    'A' => [],
    'B' => [],
    'C' => [],
    'general' => []
];

// Procesar los datos para cada fila
if ($result->num_rows > 0) {
    // Arreglo temporal para almacenar consumos calculados
    $tempConsumo = [
        'A' => [],
        'B' => [],
        'C' => [],
        'general' => []
    ];

    while ($row = $result->fetch_assoc()) {
        $id_casa = $row['id_casa'];
        $total_pagar = $row['Total_Pagar'];
        $fecha = $row['fecha'];
        
        // Extraer el mes de la fecha en formato numérico para agrupar por mes
        $mes = date("Y-m", strtotime($fecha));
        
        // Calcular el consumo para este registro
        $consumo_calculado = ($total_pagar - 53) / 45;

        // Determinar la sección de la casa
        $seccion = '';
        if ($id_casa >= 101 && $id_casa <= 172) {
            $seccion = 'A';
        } elseif ($id_casa >= 201 && $id_casa <= 273) {
            $seccion = 'B';
        } elseif ($id_casa >= 301 && $id_casa <= 374) {
            $seccion = 'C';
        }

        // Guardar el consumo calculado en el arreglo temporal por sección y mes
        if (!isset($tempConsumo[$seccion][$mes])) {
            $tempConsumo[$seccion][$mes] = 0;
        }
        $tempConsumo[$seccion][$mes] += $consumo_calculado;

        // Guardar también en el arreglo general
        if (!isset($tempConsumo['general'][$mes])) {
            $tempConsumo['general'][$mes] = 0;
        }
        $tempConsumo['general'][$mes] += $consumo_calculado;
    }

    // Transferir los datos calculados de tempConsumo a consumoPorMes, ordenando por mes
    foreach ($tempConsumo as $seccion => $meses) {
        ksort($meses); // Ordenar los resultados por mes
        $consumoPorMes[$seccion] = $meses;
    }
    
    // Enviar los datos en formato JSON
    echo json_encode([
        'status' => 'success',
        'consumoPorMes' => $consumoPorMes
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se encontraron datos de consumo.'
    ]);
}

$conn->close();
?>
