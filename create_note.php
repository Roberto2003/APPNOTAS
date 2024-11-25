<?php
include 'db.php';

if (isset($_POST['content']) && !empty(trim($_POST['content']))) {
    $content = trim($_POST['content']); // Eliminar espacios en blanco

    // Verificar conexión
    if ($conn->connect_error) {
        die(json_encode(["success" => false, "error" => "Error de conexión: " . $conn->connect_error]));
    }

    // Preparar y ejecutar la declaración
    $stmt = $conn->prepare("INSERT INTO notes (content, created_at) VALUES (?, NOW())");
    if (!$stmt) {
        die(json_encode(["success" => false, "error" => "Error en la preparación: " . $conn->error]));
    }
    
    $stmt->bind_param("s", $content);
    
    if ($stmt->execute()) {
        // Obtener el último id insertado
        $last_id = $conn->insert_id;
        echo json_encode(["success" => true, "id" => $last_id]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => "No se recibió el contenido o está vacío"]);
}

$conn->close();
?>
