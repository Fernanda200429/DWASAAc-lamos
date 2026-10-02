<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "DWASAAcÁlamos";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);
mysqli_set_charset($conn, 'utf8');

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Error en la conexión a la base de datos']));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['cambiarEstatus'])) {
        // Cambiar estatus del usuario alternando entre 0 y 1
        $id = $_GET['id'];
        $sql = "UPDATE usuario SET Estatus = CASE WHEN Estatus = 1 THEN 0 ELSE 1 END WHERE Id = '$id'";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true, 'message' => 'Estatus actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar el estatus']);
        }
    } else {
        // Obtener todos los usuarios
        $sql = "SELECT Id, Correo, Tipo, Estatus FROM usuario";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $usuarios = [];
            while ($row = $result->fetch_assoc()) {
                $usuarios[] = $row;
            }
            echo json_encode(['success' => true, 'usuarios' => $usuarios]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontraron usuarios']);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['agregarUsuario'])) {
        $correo = $_POST['Correo'];
        $contraseña = $_POST['Contraseña'];
        $tipo_usuario = $_POST['tipo_usuario'];
        $estatus = 1;

        $sql = "INSERT INTO usuario (Correo, Contraseña, Tipo, Estatus) VALUES ('$correo', '$contraseña', '$tipo_usuario', $estatus)";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true, 'message' => 'Usuario agregado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al agregar usuario: ' . $conn->error]);
        }
    } elseif (isset($_POST['editarUsuario'])) {
        // Editar usuario existente
        $id = $_POST['id'];
        $correo = $_POST['Correo'];
        $tipo = $_POST['tipo_usuario'];

        $sql = "UPDATE usuario SET Correo='$correo', Tipo='$tipo'";

        if (!empty($_POST['Contraseña'])) {
            $contraseña = $_POST['Contraseña'];
            $sql .= ", Contraseña='$contraseña'";
        }

        $sql .= " WHERE Id='$id'";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true, 'message' => 'Usuario actualizado exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar usuario']);
        }
    }
}

$conn->close();
?>
