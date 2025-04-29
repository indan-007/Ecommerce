<?php
// Site Configuration
define('SITE_URL', 'https://your-domain.com'); // Will be updated with actual domain
define('SITE_NAME', 'Online E-Commerce');

// Database Configuration
define('DB_HOST', 'localhost');     // Will be updated with hosting provider's database host
define('DB_USER', 'your_username'); // Will be updated with hosting provider's database username
define('DB_PASS', 'your_password'); // Will be updated with hosting provider's database password
define('DB_NAME', 'ecommerce_db');

// Payment Configuration
define('PAYMENT_CURRENCY', 'INR');
define('PAYMENT_SYMBOL', '₹');

// Security Configuration
define('SECURE_SESSION', true);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_httponly', 1);

// Error Reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Time Zone
date_default_timezone_set('Asia/Kolkata');

// Mobile Detection
function isMobile() {
    return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}
?> 