<?php

session_start();

require_once __DIR__. '/../connections/conn.php';

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(403);
    exit("forbidden");
}


$identifier = trim($_POST['email'] ?? '');
$pass = $_POST['password'] ?? '';
$role = $_POST['role'] ?? '';

if(!$identifier || !$pass){
    die("Missing fields");
}

// FIND USER 
$query = $connection->prepare("SELECT * FROM users WHERE email = ? OR phone = ?");


$query->bind_param("ss", $identifier, $identifier);

$query->execute();

$result = $query->get_result();

// CHECK IF EMAIL EXISTS 
if($result->num_rows !== 1){
    header("Location: ../pages/public/login.php?error=invalid");
exit;
}

$user = $result->fetch_assoc();

// VERIFY PASSWORD 

if(!password_verify($pass, $user['password_hash'])){
    header("Location: ../pages/public/login.php?error=invalid");
    exit;
}

// VERIFY SELECTED ROLE
if($role !== $user['role']){
    header("Location: ../pages/public/login.php?error=wrong-role");
    exit;
}

// LOGIN SUCCESS

$_SESSION['user_id'] = $user['id'];
$_SESSION['email'] = $user['email'];
$_SESSION['role'] = $user['role'];

// REDIRECT BASED ON ROLE 

switch ($user['role']) {
    case 'senior':
        header("Location: ../pages/senior/dashboard.php");
        break;
    case 'family':
        header("Location: ../senior/fam-dashboard.php");
        break;
    case 'volunteer':
        header("Location: ../volunteer/dashboard.php");
        break;
    default:
        header("Location: ../public/login.php?error=invalid");
        break;
}
exit;

?>