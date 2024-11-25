<?php
include 'db.php';

// Seleccionar todas las notas
$sql = "SELECT * FROM notes ORDER BY created_at DESC";
$result = $conn->query($sql);

$notes = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $notes[] = $row;
    }
}

echo json_encode($notes);

$conn->close();
?>
