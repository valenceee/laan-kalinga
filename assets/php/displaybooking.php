<?php
session_start();
require_once __DIR__. '/../connections/conn.php';

// FIX: Added Auth Check to prevent unauthorized data access
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (isset($connection->connect_error) && $connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$sql = "
SELECT
    a.id,
    a.createdAt,
    a.pName,
    a.serviceType,
    a.serviceOther,
    a.appointmentDate,
    a.timeSlot,
    a.visitType,
    a.status,
    c.address,
    c.contactNum
FROM appointments AS a
    JOIN clients AS c ON c.clientID = a.client_ID
";

$result = $connection->query($sql);

// FIX: Handle cases where the query fails
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch appointments']);
    exit;
}

$appointments = [];

while($row = $result->fetch_assoc()){
    $appointments[] = $row;
}

header('Content-Type: application/json');
echo json_encode($appointments);
?>