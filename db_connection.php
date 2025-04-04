<?php
// Database Connection Configuration
$servername = "localhost";
$username = "root";       // Default MySQL username
$password = "";           // Default MySQL password (empty for XAMPP)
$dbname = "ecommerce_db";

// Create connection with error handling
try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to ensure proper encoding
    $conn->set_charset("utf8mb4");
    
    // Optional: Debug mode (remove in production)
    if (isset($_GET['debug']) && $_GET['debug'] == 1) {
        echo "<div style='background:#f8f9fa;padding:10px;border:1px solid #ddd;border-radius:4px;margin:10px 0;'>";
        echo "<h3 style='margin-top:0;color:#28a745;'>Database Connection Successful</h3>";
        echo "<p><strong>Server:</strong> $servername</p>";
        echo "<p><strong>Database:</strong> $dbname</p>";
        echo "<p><strong>Status:</strong> Connected</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    // Log error (to file in production)
    error_log("Database connection error: " . $e->getMessage());
    
    // Show user-friendly error (customize for production)
    if (isset($_GET['debug']) && $_GET['debug'] == 1) {
        echo "<div style='background:#f8d7da;padding:10px;border:1px solid #f5c6cb;border-radius:4px;margin:10px 0;'>";
        echo "<h3 style='margin-top:0;color:#dc3545;'>Database Connection Error</h3>";
        echo "<p>" . $e->getMessage() . "</p>";
        echo "<p>Please check your database configuration.</p>";
        echo "</div>";
    } else {
        // Regular users should see a generic message
        echo "<div style='background:#f8d7da;padding:10px;border:1px solid #f5c6cb;border-radius:4px;margin:10px 0;'>";
        echo "<h3 style='margin-top:0;color:#dc3545;'>Service Temporarily Unavailable</h3>";
        echo "<p>We're experiencing technical difficulties. Please try again later.</p>";
        echo "</div>";
    }
    
    // Stop execution for security
    exit;
}

// Function to safely clean input data
function clean_input($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    $data = $conn->real_escape_string($data);
    return $data;
}

// Function to check if table exists
function table_exists($table_name) {
    global $conn, $dbname;
    $result = $conn->query("SHOW TABLES LIKE '$table_name'");
    return $result->num_rows > 0;
}

// Check if users table exists
if (!table_exists('users') && isset($_GET['setup'])) {
    // Create users table if it doesn't exist
    $sql = "CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone_number VARCHAR(20),
        address TEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) === TRUE) {
        echo "<div style='background:#d4edda;padding:10px;border:1px solid #c3e6cb;border-radius:4px;margin:10px 0;'>";
        echo "<p>Users table created successfully</p>";
        echo "</div>";
    } else {
        echo "<div style='background:#f8d7da;padding:10px;border:1px solid #f5c6cb;border-radius:4px;margin:10px 0;'>";
        echo "<p>Error creating users table: " . $conn->error . "</p>";
        echo "</div>";
    }
}
?> 