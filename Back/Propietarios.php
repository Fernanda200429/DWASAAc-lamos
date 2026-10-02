<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Función para crear la conexión a la base de datos
function createConnection() {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "condominioalamosdellago";

    $conn = new mysqli($servername, $username, $password, $dbname);
    mysqli_set_charset($conn, 'utf8');
    return $conn;
}

function getUsuariosTipo3($conn) {
    $sql = "SELECT u.Id, u.Correo 
            FROM usuario u
            WHERE u.Tipo = 3";  // Aquí 'Tipo' corresponde a la columna que contiene el tipo de usuario
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $usuarios = [];
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
        }
        return ['success' => true, 'usuarios' => $usuarios];
    } else {
        return ['success' => false, 'message' => 'No se encontraron usuarios de tipo 3'];
    }
}

function UsuarioAsignado($conn, $id) {
    // Verificamos si el id es válido antes de ejecutar la consulta
    if (empty($id) || !is_numeric($id)) {
        return ['success' => false, 'message' => 'ID inválido'];
    }

    // Consulta para obtener el correo del usuario con el ID específico
    $sql = "SELECT u.Correo 
            FROM usuario u 
            WHERE u.Id = ? AND u.Tipo = 3";  // Tipo 3 como en el ejemplo anterior
    $stmt = $conn->prepare($sql);

    // Enlazamos el parámetro
    $stmt->bind_param("i", $id);

    // Ejecutamos la consulta
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Obtenemos el correo
        $row = $result->fetch_assoc();
        return ['success' => true, 'correo' => $row['Correo']];
    } else {
        return ['success' => false, 'message' => 'Usuario no encontrado o no es de tipo 3'];
    }
}

// Función para obtener todas las casas
function getCasas($conn) {
    $sql = "SELECT Id_Casa, Letra, Numero, Propietario, id_usuario FROM casa";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $casas = [];
        while ($row = $result->fetch_assoc()) {
            $casas[] = $row;
        }
        return ['success' => true, 'casas' => $casas];
    } else {
        return ['success' => false, 'message' => 'No se encontraron casas'];
    }
}

// Función para actualizar los datos de la casa
function updateCasa($conn, $id_casa, $propietario, $id_usuario) {
    if (empty($id_casa) || empty($propietario) || empty($id_usuario)) {
        return ['success' => false, 'message' => 'Faltan parámetros necesarios'];
    }

    $sql = "UPDATE `casa` 
            SET `Propietario` = ?, `id_usuario` = ?
            WHERE `Id_Casa` = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $propietario, $id_usuario, $id_casa);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Casa actualizada exitosamente'];
    } else {
        return ['success' => false, 'message' => 'Error al actualizar casa: ' . $stmt->error];
    }
}

// Función para borrar propietario y usuario
function deletePropietario($conn, $id_casa) {
    if (empty($id_casa)) {
        return ['success' => false, 'message' => 'Faltan parámetros necesarios'];
    }

    $sql = "UPDATE `casa`
            SET `Propietario` = NULL, `id_usuario` = NULL
            WHERE `Id_Casa` = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_casa);

    if ($stmt->execute()) {
        return ['success' => true, 'message' => 'Propietario y usuario eliminados correctamente'];
    } else {
        return ['success' => false, 'message' => 'Error al eliminar propietario y usuario: ' . $stmt->error];
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $conn = createConnection();
    
    if (isset($_POST['editarCasa'])) {
        $id_casa = $_POST['Id_Casa'] ?? null;
        $propietario = $_POST['Propietario'] ?? null;
        $id_usuario = $_POST['id_usuario'] ?? null;

        if ($id_casa && $propietario && $id_usuario) {
            echo json_encode(updateCasa($conn, $id_casa, $propietario, $id_usuario));
        } else {
            echo json_encode(['success' => false, 'message' => 'Faltan parámetros necesarios']);
        }
    } elseif (isset($_POST['borrarCasa'])) {
        $id_casa = $_POST['Id_Casa'] ?? null;
        if ($id_casa) {
            echo json_encode(deletePropietario($conn, $id_casa));
        } else {
            echo json_encode(['success' => false, 'message' => 'Faltan parámetros necesarios']);
        }
    }
    
    $conn->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['getUsuariosTipo3'])) {
        $conn = createConnection();
        echo json_encode(getUsuariosTipo3($conn));
        $conn->close();
    } else {
        $conn = createConnection();
        echo json_encode(getCasas($conn));
        $conn->close();
    }
} else if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['id'])) {
    $conn = createConnection();
    $id = $_GET['id'];
    echo json_encode(UsuarioAsignado($conn, $id));
    $conn->close();
}
?>
