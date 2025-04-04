<?php
// Include database connection
require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Process resend verification request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get and sanitize input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        // Try to get data from POST
        $input = $_POST;
    }
    
    $email = isset($input['email']) ? clean_input($input['email']) : '';
    
    // Validate input
    if (empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'Email is required'
        ]);
        exit();
    }
    
    // Find user by email
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $user_id = $user['id'];
        
        // Delete existing verification codes
        $stmt = $conn->prepare("DELETE FROM verification_codes WHERE user_id = ? AND type = 'email'");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        
        // Generate new verification code
        $verification_code = bin2hex(random_bytes(3)); // 6 characters
        $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Store verification code
        $stmt = $conn->prepare("INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES (?, ?, 'email', ?)");
        $stmt->bind_param("iss", $user_id, $verification_code, $expires_at);
        $stmt->execute();
        
        // For development purposes, return the verification code
        // In production, this would be sent via email instead
        echo json_encode([
            'success' => true,
            'message' => 'Verification code sent successfully',
            'verificationCode' => $verification_code // Remove this in production
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?> 