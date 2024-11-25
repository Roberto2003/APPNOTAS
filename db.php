<?php
// Configuración de la conexión
$host = 'localhost';
$user = 'root'; // Usuario de MySQL (por defecto en XAMPP es 'root')
$password = ''; // Contraseña de MySQL (en XAMPP suele estar en blanco)
$database = 'notas'; // Nombre de tu base de datos

// Crear la conexión
$conn = new mysqli($host, $user, $password, $database);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Establecer el conjunto de caracteres a UTF-8 para evitar problemas con caracteres especiales
if (!$conn->set_charset("utf8")) {
    die("Error al configurar el conjunto de caracteres UTF-8: " . $conn->error);
}
?>

