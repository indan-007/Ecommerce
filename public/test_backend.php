<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Test database connection
require_once 'db_connection.php';

echo "<h2>Backend Status Check</h2>";

// Check PHP version
echo "<h3>PHP Version</h3>";
echo "Current PHP Version: " . phpversion() . "<br>";

// Check database connection
echo "<h3>Database Connection</h3>";
if ($conn) {
    echo "✅ Database connection successful<br>";
    
    // Get database info
    $db_info = mysqli_get_server_info($conn);
    echo "Database Server Version: " . $db_info . "<br>";
    
    // Check if tables exist
    $tables = ['users', 'verification_codes', 'payments'];
    echo "<h3>Database Tables</h3>";
    foreach ($tables as $table) {
        $result = mysqli_query($conn, "SHOW TABLES LIKE '$table'");
        if (mysqli_num_rows($result) > 0) {
            echo "✅ Table '$table' exists<br>";
            // Get row count
            $count_result = mysqli_query($conn, "SELECT COUNT(*) as count FROM $table");
            $count = mysqli_fetch_assoc($count_result)['count'];
            echo "  - Row count: $count<br>";
        } else {
            echo "❌ Table '$table' is missing<br>";
        }
    }
} else {
    echo "❌ Database connection failed: " . mysqli_connect_error() . "<br>";
}

// Check if required PHP extensions are loaded
echo "<h3>Required PHP Extensions</h3>";
$required_extensions = ['mysqli', 'json', 'session'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ $ext extension is loaded<br>";
    } else {
        echo "❌ $ext extension is missing<br>";
    }
}

// Check file permissions
echo "<h3>File Permissions</h3>";
$files_to_check = [
    'db_connection.php',
    'process_signup.php',
    'process_login.php',
    'api/products.php'
];

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        echo "✅ $file exists<br>";
        echo "  - Permissions: " . substr(sprintf('%o', fileperms($file)), -4) . "<br>";
    } else {
        echo "❌ $file is missing<br>";
    }
}

// Test API endpoint
echo "<h3>API Test</h3>";
$api_url = 'api/products.php';
if (file_exists($api_url)) {
    echo "✅ API endpoint exists<br>";
    // Try to make a request to the API
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "API Response Code: $http_code<br>";
    if ($http_code == 200) {
        echo "✅ API is responding successfully<br>";
    } else {
        echo "❌ API returned error code: $http_code<br>";
    }
} else {
    echo "❌ API endpoint is missing<br>";
}

// Close database connection
if ($conn) {
    mysqli_close($conn);
}
?> 