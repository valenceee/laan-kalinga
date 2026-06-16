<?php
session_start();
require_once __DIR__ . '/../connections/conn.php';
require_once __DIR__ . '/helpers/generateOTP.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed.']));
}

$action = $_POST['action'] ?? '';
$email  = $_SESSION['pending_registration']['email'] ?? '';

if (!$email) {
    exit(json_encode(['success' => false, 'message' => 'Session expired. Please register again.']));
}

// Resend OTP
if ($action === 'resend') {
    $sent = generateAndSendOTP($email);
    exit(json_encode(['success' => $sent]));
}

// Verify OTP
$inputOtp = trim($_POST['otp'] ?? '');

$stmt = $connection->prepare("
    SELECT otp, expires_at FROM otp_verifications
    WHERE email = ? ORDER BY id DESC LIMIT 1
");
$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    exit(json_encode(['success' => false, 'message' => 'No OTP found. Please request a new one.']));
}

if (new DateTime() > new DateTime($row['expires_at'])) {
    exit(json_encode(['success' => false, 'message' => 'OTP expired. Please request a new one.']));
}

if (!hash_equals($row['otp'], $inputOtp)) {
    exit(json_encode(['success' => false, 'message' => 'Incorrect OTP. Please try again.']));
}

// Clean up and mark verified
$del = $connection->prepare("DELETE FROM otp_verifications WHERE email = ?");
$del->bind_param('s', $email);
$del->execute();
$del->close();

$_SESSION['otp_verified'] = true;
$_SESSION['otp_email']    = $email;

exit(json_encode(['success' => true]));