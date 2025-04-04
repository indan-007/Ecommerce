<?php
// Test Database Connection
require_once '../db_connection.php';

// Force debug mode on
$_GET['debug'] = 1;

// Check database connection
echo "<h2>Database Connection Test</h2>";
if (!isset($conn) || $conn->connect_error) {
    echo "<p style='color:red;'>Database connection failed!</p>";
    exit;
}

// Show database info
echo "<h3>Database Information</h3>";
echo "<ul>";
echo "<li><strong>Server Version:</strong> " . $conn->server_info . "</li>";
echo "<li><strong>Database:</strong> " . $dbname . "</li>";
echo "</ul>";

// Check if tables exist
echo "<h3>Tables Check</h3>";
echo "<ul>";
$tables = ['users', 'verification_codes', 'payments'];
foreach ($tables as $table) {
    echo "<li><strong>$table:</strong> ";
    if (table_exists($table)) {
        echo "<span style='color:green;'>Exists</span>";
        
        // Display row count
        $result = $conn->query("SELECT COUNT(*) as count FROM $table");
        $row = $result->fetch_assoc();
        echo " (" . $row['count'] . " rows)";
    } else {
        echo "<span style='color:red;'>Missing</span>";
    }
    echo "</li>";
}
echo "</ul>";

// Test create table function
echo "<h3>Setup Link</h3>";
echo "<p>If users table is missing, <a href='test_db.php?setup=1'>click here</a> to create it.</p>";

// Show database setup SQL
echo "<h3>Database Setup SQL</h3>";
echo "<pre style='background:#f8f9fa;padding:15px;border-radius:5px;'>";
$sql_file = file_get_contents('../database.sql');
echo htmlspecialchars($sql_file);
echo "</pre>";

// Show PHP info
echo "<h3>PHP Version</h3>";
echo "<p>PHP " . phpversion() . "</p>";

// Close connection
$conn->close();
?> 