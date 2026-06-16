<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/sendOTP.php';

function generateAndSendOTP(string $email): bool {
    global $connection;

    $otp     = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    $del = $connection->prepare("DELETE FROM otp_verifications WHERE email = ?");
    $del->bind_param('s', $email);
    $del->execute();
    $del->close();

    $ins = $connection->prepare("INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)");
    $ins->bind_param('sss', $email, $otp, $expires);
    $ins->execute();
    $ins->close();

    return sendOTPEmail($email, $otp);
}