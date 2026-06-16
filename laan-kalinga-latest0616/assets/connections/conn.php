<?php

$env = parse_ini_file(__DIR__ . '/.env');

try{
    $connection = mysqli_connect(
        $env['dbHost'],
        $env['dbUser'],
        $env['dbPass'],
        $env['dbName']
    );
}
catch(mysqli_sql_exception){
    echo"Connection denied";
}
?>