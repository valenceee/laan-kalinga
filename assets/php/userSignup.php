<?php

session_start();

require_once __DIR__. '/../connections/conn.php';

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(403);
    exit("forbidden");
}

// Get Personal Information
$fName = $_POST['first_name'] ?? '';
$mName = $_POST['middle_name'] ?? '';
$lName = $_POST['last_name'] ?? '';
$suffix = $_POST['suffix'] ?? '';
$email = $_POST['email'] ?? '';
$pass = $_POST['']??'';
$phone = $_POST['phone'] ?? '';
$address = $_POST['address'] ?? '';
$region = $_POST['region'] ?? '';
$philID = $_POST['philsys_id'] ?? '';

// Get Background
$occu = $_POST['occupation'] ?? '';
$school = $_POST['school_org'] ?? '';
$prog = $_POST['program_type'] ?? '';

// Emergency Contact
$emcName = $_POST['emergency_contact_name'] ?? '';
$emcRel = $_POST['emergency_contact_relationship'] ?? '';
$emcPhone = $_POST['emergency_contact_phone'] ?? '';
$emcEmail = $_POST['emergency_contact_email'] ?? '';

// Get Documents
$govID = $_POST['government_id'] ?? '';
$nbi = $_POST['nbi_clearance'] ?? '';
$bgcheck = $_POST['background_check_consent'] ?? '';

// Get Availability, Interests, Language, Skills, and Certifications
$daysAvailable = $_POST['availability_days'] ?? '';
$interests = $_POST['interests'] ?? '';
$languages = $_POST['languages'] ?? '';
$otherSkills = $_POST['other_skills'] ?? '';
$cprCert = $_POST['has_cpr_certification'] ?? '';
$fAidCert = $_POST['has_first_aid_certification'] ?? '';
$otherCert = $_POST['other_certifications'] ?? '';

$hashedPassword = password_hash($pass, PASSWORD_DEFAULT);

    if(!$fName || !$lName || !$email || !$address || !$pass){
        header("Location: createAcc.php?error=invalid");
        exit;
    }

$check = $connection->prepare("
    SELECT role_id FROM logindata
    WHERE email = ?
");

$check->bind_param("s", $email);

$check->execute();

$result = $check->get_result();

if($result->num_rows > 0){
    header("Location: createAcc.php?error=email_exists");
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

// Execute and check
if ($insert->execute()) {
    header("Location: login.php?success=Successfully_Created");
    exit;
} else {
    header("Location: createAcc.php?error=email_exists");
        exit;
    echo "Error: " . $insert->error; //lagyan to ng error message na invalid email
}

$insert->close();
$connection->close();
?>
