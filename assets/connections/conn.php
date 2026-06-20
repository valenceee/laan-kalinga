<?php
// FIX: Added safeguard if the .env file cannot be parsed or goes missing
$env = parse_ini_file(__DIR__ . '/.env');

if (!$env) {
    die("Environment configuration error.");
}

try{
    $connection = mysqli_connect(
        $env['dbHost'],
        $env['dbUser'],
        $env['dbPass'],
        $env['dbName']
    );
}
catch(mysqli_sql_exception $e){
    // Stop execution completely if database connection fails
    die("Connection denied");
}
?>