<?php

session_start();

require_once __DIR__. '/../connections/conn.php';

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(403);
    exit("forbidden");
}

$userId = $_SESSION['user_id'];
 
$serviceType      = $_POST['service-type'] ?? '';
$serviceOther     = $_POST['service-other'] ?? '';
$visitType        = $_POST['visit-type'] ?? '';
$appointmentDate  = $_POST['appointment-date'] ?? '';
$timeSlot         = $_POST['time-slot'] ?? '';
$patientName      = $_POST['patient-name'] ?? '';
$age              = $_POST['age'] ?? '';
$contactNumber    = $_POST['contact-number'] ?? '';
$emergencyContact = $_POST['emergency-contact'] ?? '';
$companion        = $_POST['companion'] ?? '';
$preferredContact = $_POST['preferred-contact'] ?? '';
$reason           = $_POST['reason'] ?? '';
$specialNeeds     = $_POST['special-needs'] ?? '';



// Validation ng required inputs

if( !$serviceType ||
    !$visitType || 
    !$appointmentDate || 
    !$timeSlot ||
    !$patientName || 
    !$age || 
    !$contactNumber || 
    !$emergencyContact ||
    !$preferredContact || 
    !$reason
    ){
        header("Location: booking.php?error=invalid");
        exit;
    }

    // Prepared statement bago i insert sa database
$insert = $connection->prepare("
    INSERT INTO appointments(
        client_ID,
        serviceType,
        serviceOther,
        visitType,
        appointmentDate,
        timeSlot,
        pName,
        age,
        contact,
        emContact,
        companion,
        preferredContact,
        reason,
        specialNeeds
    )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$insert) {
    die("Prepare failed: " . $connection->error);
}

// Insert sa database
$insert->bind_param(
    "issssssissssss",
    $userId,
    $serviceType,
    $serviceOther,
    $visitType,
    $appointmentDate,
    $timeSlot,
    $patientName,
    $age,
    $contactNumber,
    $emergencyContact,
    $companion,
    $preferredContact,
    $reason,
    $specialNeeds
);

if ($insert->execute()) {
    header("Location: ../pages/senior/book.php?success=Successfully_Created");
    exit;
} else {
    header("Location: ../pages/senior/book.php?error=invalid");
    echo "Error: " . $insert->error; //lagyan to ng error message na invalid email
}

$insert->close();
$connection->close();
?>
