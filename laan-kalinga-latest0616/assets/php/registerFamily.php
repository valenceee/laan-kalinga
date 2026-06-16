<?php

session_start();
require_once __DIR__ . '/../connections/conn.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}

// Personal info 
$firstName  = $_POST['first_name']      ?? '';
$middleName = $_POST['middle_name']     ?? '';
$lastName   = $_POST['last_name']       ?? '';
$suffix     = $_POST['suffix']          ?? '';
$phone      = $_POST['phone']           ?? '';
$altPhone   = $_POST['alt_phone']       ?? '';
$email      = $_POST['email']           ?? '';
$password   = $_POST['password']        ?? '';

// Address 
$houseNo  = $_POST['house_number'] ?? '';
$street   = $_POST['street']       ?? '';
$barangay = $_POST['barangay']     ?? '';
$city     = 'Quezon City';
$region   = 'NCR';
$address  = implode(', ', array_filter([$houseNo, $street, $barangay, $city]));

// Family-member specific fields
$relationship          = $_POST['relationship']             ?? '';
$isDecisionMaker       = isset($_POST['decision_maker']) && $_POST['decision_maker'] === 'yes' ? 1 : 0;
$preferredContactMethod = $_POST['preferred_contact_method'] ?? '';
$updateFrequency       = $_POST['update_frequency']         ?? '';
$emergencyNotifications = isset($_POST['emergency_notifications']) ? 1 : 0;
$carePlanUpdates       = isset($_POST['care_plan_updates'])       ? 1 : 0;
$ofwStatus             = $_POST['ofw_status']               ?? 'no';
$linkedSeniorsJson     = $_POST['linked_seniors']           ?? '[]';   // JSON array of senior IDs

// Validation helper
function redirect(string $error): never {
    header('Location: ../pages/public/register-family.html?error=' . urlencode($error));
    exit;
}

// Required-field guard
if (!$firstName || !$lastName || !$email || !$phone || !$houseNo || !$street || !$barangay) {
    redirect('missing_personal_fields');
}

if (!$relationship) {
    redirect('missing_relationship');
}

// Duplicate-email check
$query = $connection->prepare("SELECT id FROM users WHERE email = ?");
$query->bind_param('s', $email);
$query->execute();
$query->store_result();

if ($query->num_rows > 0) {
    $query->close();
    redirect('email_already_exist');
}
$query->close();

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$role           = 'family';
$emailVal       = $email !== '' ? $email : null;
$profilePicVal  = null;

// Insert into users
$insertUser = $connection->prepare("
    INSERT INTO users
        (first_name, middle_name, last_name, suffix,
         email, password_hash, phone, address, region,
         profile_pic, role, created_at)
    VALUES
        (?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, NOW())
");

$insertUser->bind_param(
    'sssssssssss',
    $firstName, $middleName, $lastName, $suffix,
    $emailVal, $hashedPassword, $phone, $address, $region,
    $profilePicVal, $role
);

if (!$insertUser->execute()) {
    error_log('registerFamily – users insert failed: ' . $insertUser->error);
    $insertUser->close();
    redirect('db_error');
}
$userId = $connection->insert_id;
$insertUser->close();

$canSchedule = 0;

$insertFamily = $connection->prepare("
    INSERT INTO family_members
        (user_id, alt_phone, relationship, is_primary_decision_maker,
         can_schedule, preferred_contact_method, update_frequency,
         emergency_notifications, care_plan_updates, ofw_status,
         created_at)
    VALUES
        (?, ?, ?, ?,
         ?, ?, ?,
         ?, ?, ?,
         NOW())
");

$insertFamily->bind_param(
    'issiissiis',
    $userId,
    $altPhone,
    $relationship,
    $isDecisionMaker,
    $canSchedule,
    $preferredContactMethod,
    $updateFrequency,
    $emergencyNotifications,
    $carePlanUpdates,
    $ofwStatus
);

if (!$insertFamily->execute()) {
    error_log('registerFamily – family_members insert failed: ' . $insertFamily->error);
    $insertFamily->close();
    redirect('db_error');
}
$insertFamily->close();

$connection->close();
header('Location: ../pages/public/login.php?success=registration_submitted');
exit;
?>