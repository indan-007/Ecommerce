<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once 'db_connection.php';

    // Test database connection
    echo "Testing database connection...<br>";
    if ($conn) {
        echo "Database connection successful!<br>";
        
        // Test if tables exist
        $tables = ['users', 'verification_codes', 'categories', 'products'];
        foreach ($tables as $table) {
            $result = mysqli_query($conn, "SHOW TABLES LIKE '$table'");
            if (mysqli_num_rows($result) > 0) {
                echo "Table '$table' exists<br>";
            } else {
                echo "Table '$table' does not exist<br>";
            }
        }
        
        // Test products API
        echo "<br>Testing products API...<br>";
        $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM products");
        if ($result === false) {
            echo "Error querying products table: " . mysqli_error($conn) . "<br>";
        } else {
            $row = mysqli_fetch_assoc($result);
            echo "Number of products in database: " . $row['count'] . "<br>";
        }
        
        // Test categories API
        echo "<br>Testing categories API...<br>";
        $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM categories");
        if ($result === false) {
            echo "Error querying categories table: " . mysqli_error($conn) . "<br>";
        } else {
            $row = mysqli_fetch_assoc($result);
            echo "Number of categories in database: " . $row['count'] . "<br>";
        }
    } else {
        echo "Database connection failed: " . mysqli_connect_error() . "<br>";
    }

    mysqli_close($conn);
} catch (Exception $e) {
    echo "An error occurred: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
}
?> 