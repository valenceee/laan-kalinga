<?php

require_once __DIR__. '/../connections/conn.php';

if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
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

$appointments = [];

while($row = $result->fetch_assoc()){
    $appointments[] = $row;
}

header('Content-Type: application/json');
echo json_encode($appointments);