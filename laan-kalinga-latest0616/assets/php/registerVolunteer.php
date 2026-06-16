<?php

session_start();
require_once __DIR__ . '/../connections/conn.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}

// ===== STEP 1: Personal Information =====
$firstName  = $_POST['first_name']        ?? '';
$middleName = $_POST['middle_name']       ?? '';
$lastName   = $_POST['last_name']         ?? '';
$suffix     = $_POST['suffix']            ?? '';
$email      = $_POST['email']             ?? '';
$phone      = $_POST['phone']             ?? '';
$houseNo    = $_POST['house_number']      ?? '';
$street     = $_POST['street']            ?? '';
$barangay   = $_POST['barangay']          ?? '';
$city       = $_POST['city']             ?? 'Quezon City';
$province   = $_POST['province']         ?? 'Metro Manila';

$address = implode(', ', array_filter([$houseNo, $street, $barangay, $city, $province]));
$region  = $province;

$occupation  = $_POST['occupation']  ?? '';
$programType = $_POST['program_type'] ?? '';
$schoolOrg   = $_POST['school_org']   ?? '';

// Emergency contact
$emcName   = $_POST['emergency_contact_name']         ?? '';
$emcRel    = $_POST['emergency_contact_relationship'] ?? '';
$emcPhone  = $_POST['emergency_contact_phone']        ?? '';
$emcEmail  = $_POST['emergency_contact_email']        ?? '';

// ===== STEP 2: Verification & Availability =====
$bgCheckConsent  = isset($_POST['background_check_consent']) ? 1 : 0;

// Availability days – multiple checkboxes; PHP may only get last value
// If the HTML used name="availability_days[]", $_POST['availability_days'] would be an array.
// Without brackets we defensively convert a single value to an array for consistency.
$availDays = $_POST['availability_days'] ?? [];
if (!is_array($availDays)) {
    $availDays = [$availDays];
}
$availDaysStr = implode(',', $availDays);

$availTime = $_POST['availability_time'] ?? '';

// ===== STEP 3: Skills, Interests & Motivation =====
$interests = $_POST['interests'] ?? [];
if (!is_array($interests)) {
    $interests = [$interests];
}
$interestsStr = implode(',', $interests);

$languages = $_POST['languages'] ?? [];
if (!is_array($languages)) {
    $languages = [$languages];
}
$languagesStr = implode(',', $languages);

$otherSkills       = $_POST['other_skills']        ?? '';
$volunteerReason    = $_POST['volunteer_reason']     ?? '';
$volunteerReasonOther = $_POST['volunteer_reason_other'] ?? '';
$motivation         = $_POST['motivation_statement'] ?? '';

// ===== STEP 4: Terms =====
$termsAccepted     = isset($_POST['terms_accepted'])     ? 1 : 0;
$accuracyConfirmed = isset($_POST['accuracy_confirmed']) ? 1 : 0;
$dataPrivacy       = isset($_POST['data_privacy_consent']) ? 1 : 0;
$codeOfConduct     = isset($_POST['code_of_conduct'])     ? 1 : 0;

// ===== Validation helper =====
function redirect(string $error): never {
    header('Location: ../pages/public/register-volunteer.html?error=' . urlencode($error));
    exit;
}

// Required-field guard
if (!$firstName || !$lastName || !$email || !$phone || !$houseNo || !$street || !$barangay) {
    redirect('missing_personal_fields');
}

if (!$emcName || !$emcRel || !$emcPhone) {
    redirect('missing_emergency_fields');
}

if (empty($availDays) || !$availTime) {
    redirect('missing_availability');
}

if (empty($interests)) {
    redirect('missing_interests');
}

if (!$volunteerReason || !$motivation) {
    redirect('missing_motivation');
}

if (!$termsAccepted || !$accuracyConfirmed || !$dataPrivacy || !$codeOfConduct) {
    redirect('missing_consent');
}

// ===== Duplicate email check =====
$query = $connection->prepare("SELECT id FROM users WHERE email = ?");
$query->bind_param('s', $email);
$query->execute();
$query->store_result();

if ($query->num_rows > 0) {
    $query->close();
    redirect('email_already_exist');
}
$query->close();

// ===== Handle file uploads =====
$uploadDir = __DIR__ . '/../uploads/volunteer/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Profile picture upload
$profilePicPath = null;
if (!empty($_FILES['profile_pic']['name'])) {
    $ext      = pathinfo($_FILES['profile_pic']['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . uniqid() . '.' . $ext;
    $dest     = $uploadDir . $filename;
    if (move_uploaded_file($_FILES['profile_pic']['tmp_name'], $dest)) {
        $profilePicPath = 'uploads/volunteer/' . $filename;
    }
}

// Government ID upload
$govIdPath = null;
if (!empty($_FILES['government_id']['name'])) {
    $ext      = pathinfo($_FILES['government_id']['name'], PATHINFO_EXTENSION);
    $filename = 'govid_' . uniqid() . '.' . $ext;
    $dest     = $uploadDir . $filename;
    if (move_uploaded_file($_FILES['government_id']['tmp_name'], $dest)) {
        $govIdPath = 'uploads/volunteer/' . $filename;
    }
} else {
    redirect('missing_government_id');
}

// ===== Insert into users table =====
$role = 'volunteer';
$emailVal = $email !== '' ? $email : null;

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

// Volunteers don't set a password during registration (no password field in form).
// A temporary placeholder hash is stored; they can set a password later via "forgot password".
$placeholderHash = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);

$insertUser->bind_param(
    'sssssssssss',
    $firstName, $middleName, $lastName, $suffix,
    $emailVal, $placeholderHash, $phone, $address, $region,
    $profilePicPath, $role
);

if (!$insertUser->execute()) {
    error_log('registerVolunteer – users insert failed: ' . $insertUser->error);
    $insertUser->close();
    redirect('db_error');
}
$userId = $connection->insert_id;
$insertUser->close();

// ===== Insert into volunteer_profiles table =====
$insertProfile = $connection->prepare("
    INSERT INTO volunteer_profiles
        (user_id,
         occupation, program_type, school_org,
         emergency_contact_name, emergency_contact_relationship,
         emergency_contact_phone, emergency_contact_email,
         government_id_path, background_check_consent,
         availability_days, availability_time,
         interests, languages, other_skills,
         volunteer_reason, volunteer_reason_other, motivation_statement,
         terms_accepted, accuracy_confirmed, data_privacy_consent, code_of_conduct,
         created_at)
    VALUES
        (?,
         ?, ?, ?,
         ?, ?,
         ?, ?,
         ?, ?,
         ?, ?,
         ?, ?, ?,
         ?, ?, ?,
         ?, ?, ?, ?,
         NOW())
");

$insertProfile->bind_param(
    'issssssssssssssssiiii',
    $userId,
    $occupation, $programType, $schoolOrg,
    $emcName, $emcRel,
    $emcPhone, $emcEmail,
    $govIdPath, $bgCheckConsent,
    $availDaysStr, $availTime,
    $interestsStr, $languagesStr, $otherSkills,
    $volunteerReason, $volunteerReasonOther, $motivation,
    $termsAccepted, $accuracyConfirmed, $dataPrivacy, $codeOfConduct
);

if (!$insertProfile->execute()) {
    error_log('registerVolunteer – volunteer_profiles insert failed: ' . $insertProfile->error);
    $insertProfile->close();
    redirect('db_error');
}
$insertProfile->close();

$connection->close();
header('Location: ../pages/public/login.php?success=registration_submitted');
exit;