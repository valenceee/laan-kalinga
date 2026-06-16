<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../pages/public/register-senior.html');
    exit;
}

if (empty($_SESSION['otp_verified']) || empty($_SESSION['pending_registration'])) {
    header('Location: ../pages/public/register-senior.html');
    exit;
}

$role = $_SESSION['pending_role'] ?? 'senior';
$_POST = $_SESSION['pending_registration'];

match ($role) {
    'volunteer' => require __DIR__ . '/registerVolunteer.php',
    'family'    => require __DIR__ . '/registerFamily.php',
    default     => require __DIR__ . '/registerSenior.php',
};