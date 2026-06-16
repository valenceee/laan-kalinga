<?php

session_start();
require_once __DIR__ . '/../connections/conn.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}

function redirectError(string $error): never
{
    header('Location: ../pages/public/register-volunteer.html?error=' . urlencode($error));
    exit;
}

// First Step: Personal Information

$firstName  = trim($_POST['first_name'] ?? '');
$middleName = trim($_POST['middle_name'] ?? '');
$lastName   = trim($_POST['last_name'] ?? '');
$suffix     = trim($_POST['suffix'] ?? '');

$email      = trim($_POST['email'] ?? '');
$phone      = trim($_POST['phone'] ?? '');

$password         = $_POST['password'] ?? '';
$confirmPassword  = $_POST['confirm_password'] ?? '';

$houseNo  = trim($_POST['house_number'] ?? '');
$street   = trim($_POST['street'] ?? '');
$barangay = trim($_POST['barangay'] ?? '');

$city   = 'Quezon City';
$region = 'NCR';

$address = implode(', ', array_filter([
    $houseNo,
    $street,
    $barangay,
    $city
]));

$occupation  = trim($_POST['occupation'] ?? '');
$programType = trim($_POST['program_type'] ?? '');
$schoolOrg   = trim($_POST['school_org'] ?? '');

// Emergency Contact

$emcName  = trim($_POST['emergency_contact_name'] ?? '');
$emcRel   = trim($_POST['emergency_contact_relationship'] ?? '');
$emcPhone = trim($_POST['emergency_contact_phone'] ?? '');
$emcEmail = trim($_POST['emergency_contact_email'] ?? '');

// Availability

$availDays = $_POST['availability_days'] ?? [];

if (!is_array($availDays)) {
    $availDays = [$availDays];
}

$availTime = $_POST['availability_time'] ?? '';

// Skills and Interests

$interests = $_POST['interests'] ?? [];

if (!is_array($interests)) {
    $interests = [$interests];
}

$languages = $_POST['languages'] ?? [];

if (!is_array($languages)) {
    $languages = [$languages];
}

$otherSkills = trim($_POST['other_skills'] ?? '');

$languagesStr = implode(',', $languages);

$volunteerReason      = trim($_POST['volunteer_reason'] ?? '');
$volunteerReasonOther = trim($_POST['volunteer_reason_other'] ?? '');

$motivation = trim($_POST['motivation_statement'] ?? '');

// Consents

$bgCheckConsent  = isset($_POST['background_check_consent']) ? 1 : 0;

$termsAccepted     = isset($_POST['terms_accepted']) ? 1 : 0;
$accuracyConfirmed = isset($_POST['accuracy_confirmed']) ? 1 : 0;
$dataPrivacy       = isset($_POST['data_privacy_consent']) ? 1 : 0;
$codeOfConduct     = isset($_POST['code_of_conduct']) ? 1 : 0;

// Validation

if (
    !$firstName ||
    !$lastName ||
    !$email ||
    !$phone ||
    !$houseNo ||
    !$street ||
    !$barangay
) {
    redirectError('missing_personal_fields');
}

if (
    !$emcName ||
    !$emcRel ||
    !$emcPhone
) {
    redirectError('missing_emergency_fields');
}

if (empty($availDays) || !$availTime) {
    redirectError('missing_availability');
}

if (empty($interests)) {
    redirectError('missing_interests');
}

if (!$volunteerReason || !$motivation) {
    redirectError('missing_motivation');
}

if (
    !$termsAccepted ||
    !$accuracyConfirmed ||
    !$dataPrivacy ||
    !$codeOfConduct
) {
    redirectError('missing_consent');
}

if (strlen($password) < 8) {
    redirectError('invalid_password');
}

if ($password !== $confirmPassword) {
    redirectError('password_mismatch');
}

// Start OTP Gate
require_once __DIR__ . '/helpers/generateOTP.php';

$otpVerified = ($_SESSION['otp_verified'] ?? false) === true;
$otpEmail    = $_SESSION['otp_email'] ?? '';

if (!$otpVerified || $otpEmail !== $email) {
    $_SESSION['pending_registration'] = $_POST;
    $_SESSION['pending_role']         = 'volunteer'; // change to 'volunteer' or 'family'
    $_SESSION['otp_verified']         = false;

    if (!generateAndSendOTP($email)) {
        redirectError('otp_send_failed'); // use redirectError() for volunteer
    }

    header('Location: ../pages/public/verify-otp.html');
    exit;
}

// Clear after use
unset($_SESSION['otp_verified'], $_SESSION['otp_email']);
// End of OTP Gate

// CHECK EMAIL DUPLICATE

$checkEmail = $connection->prepare(
    "SELECT id FROM users WHERE email = ?"
);

$checkEmail->bind_param("s", $email);
$checkEmail->execute();
$checkEmail->store_result();

if ($checkEmail->num_rows > 0) {
    $checkEmail->close();
    redirectError('email_already_exist');
}

$checkEmail->close();

// Handle file uploads

$uploadDir = __DIR__ . '/../uploads/volunteers/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$profilePicPath = null;

if (!empty($_FILES['profile_pic']['name'])) {

    $extension = pathinfo(
        $_FILES['profile_pic']['name'],
        PATHINFO_EXTENSION
    );

    $fileName = 'profile_' . uniqid() . '.' . $extension;

    move_uploaded_file(
        $_FILES['profile_pic']['tmp_name'],
        $uploadDir . $fileName
    );

    $profilePicPath = 'uploads/volunteers/' . $fileName;
}

$govIdPath = null;

if (!empty($_FILES['government_id']['name'])) {

    $extension = pathinfo(
        $_FILES['government_id']['name'],
        PATHINFO_EXTENSION
    );

    $fileName = 'govid_' . uniqid() . '.' . $extension;

    move_uploaded_file(
        $_FILES['government_id']['tmp_name'],
        $uploadDir . $fileName
    );

    $govIdPath = 'uploads/volunteers/' . $fileName;
} else {
    redirectError('missing_government_id');
}

// Insert into database

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);

$role = 'volunteer';

$insertUser = $connection->prepare("
    INSERT INTO users
    (
        first_name,
        middle_name,
        last_name,
        suffix,
        email,
        password_hash,
        phone,
        address,
        region,
        profile_pic,
        role
    )
    VALUES
    (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
");

$insertUser->bind_param(
    "sssssssssss",
    $firstName,
    $middleName,
    $lastName,
    $suffix,
    $email,
    $passwordHash,
    $phone,
    $address,
    $region,
    $profilePicPath,
    $role
);

if (!$insertUser->execute()) {
    die($insertUser->error);
}

$userId = $connection->insert_id;

$insertUser->close();

// INSERT CAREGIVER

$specialization = implode(',', $interests);

$maxHoursPerWeek = 20;

$insertCaregiver = $connection->prepare("
    INSERT INTO caregivers
    (
        user_id,
        specialization,
        certification,
        maxHoursPerWeek,

        occupation,
        programType,
        schoolOrg,

        emergencyContactName,
        emergencyRelationship,
        emergencyPhone,
        emergencyEmail,

        governmentIdPath,
        backgroundCheckConsent,

        languages,

        volunteerReason,
        volunteerReasonOther,
        motivationStatement,

        termsAccepted,
        accuracyConfirmed,
        dataPrivacyConsent,
        codeOfConduct
    )
    VALUES
    (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?,
        ?, ?, ?,
        ?, ?, ?, ?
    )
");

$insertCaregiver->bind_param(
    "ississssssssissssiiii",
    $userId,
    $specialization,
    $otherSkills,
    $maxHoursPerWeek,

    $occupation,
    $programType,
    $schoolOrg,

    $emcName,
    $emcRel,
    $emcPhone,
    $emcEmail,

    $govIdPath,
    $bgCheckConsent,

    $languagesStr,

    $volunteerReason,
    $volunteerReasonOther,
    $motivation,

    $termsAccepted,
    $accuracyConfirmed,
    $dataPrivacy,
    $codeOfConduct
);

if (!$insertCaregiver->execute()) {
    die($insertCaregiver->error);
}

$caregiverId = $connection->insert_id;

$insertCaregiver->close();

// INSERT AVAILABILITY

$dayMap = [
    'monday'    => 'Mon',
    'tuesday'   => 'Tue',
    'wednesday' => 'Wed',
    'thursday'  => 'Thu',
    'friday'    => 'Fri',
    'saturday'  => 'Sat',
    'sunday'    => 'Sun'
];

switch ($availTime) {

    case 'morning':
        $start = '08:00:00';
        $end   = '12:00:00';
        break;

    case 'afternoon':
        $start = '12:00:00';
        $end   = '17:00:00';
        break;

    case 'evening':
        $start = '17:00:00';
        $end   = '21:00:00';
        break;

    default:
        $start = '08:00:00';
        $end   = '17:00:00';
        break;
}

$availabilityStmt = $connection->prepare("
    INSERT INTO caregiver_availability
    (
        caregiver_id,
        dayOfWeek,
        startTime,
        endTime
    )
    VALUES
    (
        ?, ?, ?, ?
    )
");

foreach ($availDays as $day) {

    if (!isset($dayMap[$day])) {
        continue;
    }

    $dbDay = $dayMap[$day];

    $availabilityStmt->bind_param(
        "isss",
        $caregiverId,
        $dbDay,
        $start,
        $end
    );

    $availabilityStmt->execute();
}

$availabilityStmt->close();

$connection->close();

header(
    'Location: ../pages/public/login.php?success=registration_submitted'
);
exit;
?>