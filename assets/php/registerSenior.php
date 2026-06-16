<?php

session_start();
require_once __DIR__ . '/../connections/conn.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}

// Personal info
$firstName   = $_POST['first_name'] ?? '';
$middleName  = $_POST['middle_name'] ?? '';
$lastName    = $_POST['last_name'] ?? '';
$suffix      = $_POST['suffix'] ?? '';
$dob         = $_POST['date_of_birth'] ?? '';
$gender      = $_POST['gender'] ?? '';
$civilStatus = $_POST['civil_status'] ?? '';
$phone       = $_POST['phone'] ?? '';
$email       = $_POST['email'] ?? '';
$password    = $_POST['password'] ?? '';
$confirmPw   = $_POST['confirm_password'] ?? '';
$philsysId   = $_POST['philsys_id'] ?? '';

// Address
$houseNo  = $_POST['house_number'] ?? '';
$street   = $_POST['street'] ?? '';
$barangay = $_POST['barangay'] ?? '';
$city     = $_POST['city'] ?? '';
$province = $_POST['province'] ?? '';
$address  = implode(', ', array_filter([$houseNo, $street, $barangay, $city, $province])) ?? '';
$region   = $province; 

// Health and Contact
$condition = $_POST['chronic_conditions'] ?? '';
$allergies = $_POST['allergies'] ?? '';
$medications = $_POST['medications'] ?? '';
$bloodType = $_POST['blood_type'] ?? '';
$pwd = $_POST['pwd_status'] ?? '';

$birthplace = $_POST['birthplace'] ?? '';
$oscaId     = $_POST['osca_id'] ?? '';

// Terms (checkbox checked)
$termsAccepted     = isset($_POST['terms_accepted']);
$accuracyConfirmed = isset($_POST['accuracy_confirmed']);
$dataPrivacy       = isset($_POST['data_privacy_consent']);

// Validation
function redirect(string $error): never {
    header('Location: ../pages/public/register-senior.html?error=' . urlencode($error));
    exit;
}

// Required fields
if (!$firstName || !$lastName || !$phone || !$dob || !$gender || !$civilStatus || !$houseNo || !$street || !$barangay) {
    redirect('missing_personal_fields');
}

// Start OTP Gate
require_once __DIR__ . '/helpers/generateOTP.php';

$otpVerified = ($_SESSION['otp_verified'] ?? false) === true;
$otpEmail    = $_SESSION['otp_email'] ?? '';

if (!$otpVerified || $otpEmail !== $email) {
    $_SESSION['pending_registration'] = $_POST;
    $_SESSION['pending_role']         = 'senior'; // change to 'volunteer' or 'family'
    $_SESSION['otp_verified']         = false;

    if (!generateAndSendOTP($email)) {
        redirect('otp_send_failed'); // use redirectError() for volunteer
    }

    header('Location: ../pages/public/verify-otp.html');
    exit;
}

// Clear after use
unset($_SESSION['otp_verified'], $_SESSION['otp_email']);
// End of OTP Gate

// Find user
$query = $connection->prepare("
    SELECT * FROM users
    WHERE email = ?
");

$query->bind_param("s", $email);

$query->execute();

$result = $query->get_result();

if($result->num_rows > 0){
    redirect('email_already_exist');
}

// Hashed password for security
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$role     = 'senior';
$emailVal = $email !== '' ? $email : null;

$uploadDir = __DIR__ . '/../uploads/seniors/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$profilePicVal = null;

if (!empty($_FILES['profile_pic']['name'])) {

    $extension = strtolower(
        pathinfo($_FILES['profile_pic']['name'], PATHINFO_EXTENSION)
    );

    $allowed = ['jpg', 'jpeg', 'png'];

    if (in_array($extension, $allowed)) {

        $fileName = 'senior_' . uniqid() . '.' . $extension;

        move_uploaded_file(
            $_FILES['profile_pic']['tmp_name'],
            $uploadDir . $fileName
        );

        $profilePicVal = 'uploads/seniors/' . $fileName;
    }
}

// Insert into users table
$insertUser = $connection->prepare("
    INSERT INTO users
        (first_name, middle_name, last_name, suffix,
         email, password_hash, phone, address, region, philsys_id,
         profile_pic, role, created_at)
    VALUES
        (?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, ?, NOW())
");

$insertUser->bind_param(
    'ssssssssssss',
    $firstName, $middleName, $lastName, $suffix,
    $emailVal, $hashedPassword, $phone, $address, $region, $philsysId,
    $profilePicVal, $role
);

// Execute and check
if (!$insertUser->execute()) {
    error_log('registerSenior – users insert failed: ' . $insertUser->error);
    $insertUser->close();
    redirect('db_error');
}
$userId = $connection->insert_id;
$insertUser->close();

//Insert into clients table
$insertClient = $connection->prepare("
    INSERT INTO clients
        (user_id, clientFName, clientLName, suffix,
         birthday, birthplace, sex, civilStatus,
         philID, oscaID, email, contactNum,
         address, region)
    VALUES
        (?, ?, ?, ?,
         ?, ?, ?, ?,
         ?, ?, ?, ?,
         ?, ?)
");

$insertClient->bind_param(
    'isssssssssssss',
    $userId, $firstName, $lastName, $suffix,
    $dob, $birthplace, $gender, $civilStatus,
    $philsysId, $oscaId, $emailVal, $phone,
    $address, $region
);

if (!$insertClient->execute()) {
    error_log('registerSenior – clients insert failed: ' . $insertClient->error);
    $insertClient->close();
    redirect('db_error');
}

$insertClient->close();

$connection->close();
header('Location: ../pages/public/login.php?success=registration_submitted');
exit;
?>
