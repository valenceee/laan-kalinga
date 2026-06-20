<?php
session_start();
require_once __DIR__. '/../connections/conn.php';

// Auth Check - Ensure user is actually logged in before processing a booking
if (!isset($_SESSION['user_id'])) {
    header("Location: ../pages/public/login.php?error=unauthorized");
    exit;
}

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(403);
    exit("forbidden");
}

// FIX: Added missing POST variable extractions
$serviceType = $_POST['serviceType'] ?? '';
$serviceOther = $_POST['serviceOther'] ?? '';
$visitType = $_POST['visitType'] ?? '';
$appointmentDate = $_POST['appointmentDate'] ?? '';
$timeSlot = $_POST['timeSlot'] ?? '';
$patientName = $_POST['pName'] ?? '';
$age = $_POST['age'] ?? '';
$contactNumber = $_POST['contact'] ?? '';
$emergencyContact = $_POST['emContact'] ?? '';
$companion = $_POST['companion'] ?? '';
$preferredContact = $_POST['preferredContact'] ?? '';
$reason = $_POST['reason'] ?? '';
$specialNeeds = $_POST['specialNeeds'] ?? '';

if( !$serviceType || !$visitType || !$appointmentDate || !$timeSlot ||
    !$patientName || !$age || !$contactNumber || !$emergencyContact ||
    !$preferredContact || !$reason ){
        header("Location: ../pages/senior/book.php?error=invalid");
        exit;
}

$insert = $connection->prepare("
    INSERT INTO appointments(
        serviceType, serviceOther, visitType, appointmentDate, timeSlot,
        pName, age, contact, emContact, companion, preferredContact,
        reason, specialNeeds
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

if (!$insert) {
    die("Prepare failed: " . $connection->error);
}

$insert->bind_param(
    "ssssssissssss",
    $serviceType, $serviceOther, $visitType, $appointmentDate, $timeSlot,
    $patientName, $age, $contactNumber, $emergencyContact, $companion,
    $preferredContact, $reason, $specialNeeds
);

if ($insert->execute()) {
    header("Location: ../pages/senior/book.php?success=Successfully_Created");
    exit;
} else {
    error_log("Booking Error: " . $insert->error); 
    header("Location: ../pages/senior/book.php?error=db_error");
    exit;
}

$insert->close();
$connection->close();
?>