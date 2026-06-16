<?php
require_once __DIR__ . '/../../../vendor/autoload.php'; // assets/php/helpers → root

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendOTPEmail(string $email, string $otp): bool
{
    try {

        $mail = new PHPMailer(true);

        $mail->isSMTP();

        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;

        // YOUR GMAIL
        $mail->Username = 'ptatoo26@gmail.com';

        // APP PASSWORD
        $mail->Password = 'uujx lpds cbgj bdry';

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom(
            'ptatoo26@gmail.com',
            'Laan-Kalinga'
        );

        $mail->addAddress($email);

        $mail->isHTML(true);

        $mail->Subject = 'Laan-Kalinga OTP Verification';

        $mail->Body = "
            <h2>Email Verification</h2>

            <p>Your OTP code is:</p>

            <h1>{$otp}</h1>

            <p>This code will expire in 10 minutes.</p>
        ";

        return $mail->send();

    } catch (Exception $e) {

        echo $e->getMessage();
        return false;
    }
}