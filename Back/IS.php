<?php
require "Conexion.php";
// Verificar la conexión
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Conexión fallida: ' . $conn->connect_error]));
}

// Permitir acceso CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

$request_method = $_SERVER['REQUEST_METHOD'];

// Manejar solicitud OPTIONS para CORS preflight
if ($request_method === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

// Obtener el cuerpo de la solicitud
$data = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['status' => 'error', 'message' => 'Error al decodificar JSON: ' . json_last_error_msg()]);
    exit;
}

// Función para iniciar sesión
function login($conn, $data) {
    $correo = $data['email'] ?? '';
    $contraseña = $data['password'] ?? '';

    if (!empty($correo) && !empty($contraseña)) {
        $stmt = $conn->prepare("SELECT * FROM usuario WHERE Correo = ? AND Contraseña = ?");
        $stmt->bind_param("ss", $correo, $contraseña);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();

            // Validar el estado del usuario (Estatus)
            if ($row["Estatus"] == 1) {
                // Validar el estado de la sesión (sesion)
                if ($row["Sesion"] == 0) {
                    // Actualizar el estado de la sesión a 1
                    $stmt = $conn->prepare("UPDATE usuario SET Sesion = 1 WHERE Id = ?");
                    $stmt->bind_param("i", $row["Id"]);
                    $update = $stmt->execute();

                    if ($update) {
                        echo json_encode([
                            "success" => true,
                            "user_id" => $row["Id"],
                            "username" => $row["Correo"],
                            "user_type" => $row["Tipo"]
                        ]);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el estado de la sesión']);
                    }
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "La sesión ya está activa en otro dispositivo"
                    ]);
                }
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "La cuenta está inactiva, por favor contacta al administrador"
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Nombre de usuario o contraseña incorrectos"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Datos incompletos o no válidos"
        ]);
    }
}

// Función para cerrar sesión
function logout($conn, $data) {
    $userId = $data['user_id'] ?? '';
    
    if (!empty($userId)) {
        $stmt = $conn->prepare("UPDATE usuario SET Sesion = 0 WHERE Id = ?");
        $stmt->bind_param("i", $userId);
        $update = $stmt->execute();

        // Debugging
        if ($update) {
            echo json_encode(['success' => true, 'message' => 'Sesión cerrada exitosamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al cerrar la sesión']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de usuario no proporcionado']);
    }
}


// Función para verificar usuario por correo
function check_user_by_email($conn, $data) {
    $correo = $data['email'] ?? '';

    if (!empty($correo)) {
        $stmt = $conn->prepare("SELECT * FROM usuario WHERE Correo = ?");
        $stmt->bind_param("s", $correo);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode([
                "success" => true,
                "user_id" => $row["Id"],
                "user_type" => $row["Tipo"],
                "email" => $row["Correo"],
                "status" => $row["Estatus"]
            ]);
        } else {
            /*$stmt = $conn->prepare("INSERT INTO usuario (Correo, Tipo, Estatus, Sesion) VALUES (?, ?, ?, ?)");
            $tipo = 3;
            $estatus = 1;
            $sesion = 0;
            $stmt->bind_param("siii", $correo, $tipo, $estatus, $sesion);
            $insert = $stmt->execute();

            if ($insert) {
                $insert_id = $conn->insert_id;
                echo json_encode([
                    "success" => true,
                    "user_id" => $insert_id,
                    "user_type" => 3,
                    "email" => $correo,
                    "status" => 1
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Error al intentar registrar al usuario"
                ]);
            }*/
            echo json_encode([
                "success" => false,
                "message" => "No tienes acceso, contacta al administrador"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Correo electrónico no proporcionado"
        ]);
    }
}

// Llamar a la función según la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Cambiar según el tipo de operación deseada
    $action = $data['action'] ?? '';
    if ($action === 'login') {
        login($conn, $data);
    } elseif ($action === 'logout') {
        logout($conn, $data);
    } elseif ($action === 'check_user') {
        check_user_by_email($conn, $data);
    }
}

$conn->close();
?>
