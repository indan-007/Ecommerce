<?php
$servername = "localhost";
$port = 3307;  // Updated port
$username = "root";
$password = "";
$dbname = "ecommerce_db";  // Updated database name

// Create connection with port specification
$conn = mysqli_connect($servername, $username, $password, $dbname, $port);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?> 