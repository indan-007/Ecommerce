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

// Process verification request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get and sanitize input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        // Try to get data from POST
        $input = $_POST;
    }
    
    $email = isset($input['email']) ? clean_input($input['email']) : '';
    $code = isset($input['code']) ? clean_input($input['code']) : '';
    
    // Validate input
    if (empty($email) || empty($code)) {
        echo json_encode([
            'success' => false,
            'message' => 'Email and verification code are required'
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
        
        // Check verification code
        $stmt = $conn->prepare("SELECT * FROM verification_codes WHERE user_id = ? AND code = ? AND type = 'email' AND expires_at > NOW() LIMIT 1");
        $stmt->bind_param("is", $user_id, $code);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Mark user as verified
            $stmt = $conn->prepare("UPDATE users SET is_verified = 1 WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            
            // Delete used verification code
            $stmt = $conn->prepare("DELETE FROM verification_codes WHERE user_id = ? AND type = 'email'");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Email verified successfully. You can now log in.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid or expired verification code'
            ]);
        }
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