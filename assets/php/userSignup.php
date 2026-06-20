<?php
session_start();
require_once __DIR__. '/../connections/conn.php';

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(403);
    exit("forbidden");
}

$role = $_POST['role'] ?? 'user';

// Get Personal Information
$fName = $_POST['first_name'] ?? '';
$mName = $_POST['middle_name'] ?? '';
$lName = $_POST['last_name'] ?? '';
$suffix = $_POST['suffix'] ?? '';
$email = $_POST['email'] ?? '';
$pass = $_POST['password'] ?? ''; 
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$region = $_POST['region'] ?? '';
$philID = $_POST['philsys_id'] ?? '';



// FIX: Validate empty variables BEFORE performing expensive hashing
if(!$fName || !$lName || !$email || !$address || !$pass){
    header("Location: ../pages/public/createAcc.php?error=invalid");
    exit;
}

$hashedPassword = password_hash($pass, PASSWORD_DEFAULT);

$check = $connection->prepare("
    SELECT role_id FROM logindata
    WHERE email = ?
");

$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if($result->num_rows > 0){
    header("Location: ../pages/public/createAcc.php?error=email_exists");
    exit;
}

$insert = $connection->prepare("
    INSERT INTO logindata
    (role, email, password, firstN, lastN, address)
    VALUES(?, ?, ?, ?, ?, ?)
");

$insert->bind_param(
    "ssssss",
    $role, 
    $email,
    $hashedPassword,
    $fName,
    $lName,
    $address
);

if ($insert->execute()) {
    header("Location: ../pages/public/login.php?success=Successfully_Created");
    exit;
} else {
    error_log("Error: " . $insert->error); 
    header("Location: ../pages/public/createAcc.php?error=db_error");
    exit;
}

$insert->close();
$connection->close();
?>