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

// Process login request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get and sanitize input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        // Try to get data from POST
        $input = $_POST;
    }
    
    $username = isset($input['username']) ? clean_input($input['username']) : '';
    $password = isset($input['password']) ? $input['password'] : '';
    
    // Validate input
    if (empty($username) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required'
        ]);
        exit();
    }
    
    // Check if username is an email
    $is_email = filter_var($username, FILTER_VALIDATE_EMAIL);
    
    // Prepare query based on input type
    if ($is_email) {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    } else {
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    }
    
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Check if email is verified
            if ($user['is_verified'] == 0) {
                // Generate new verification code
                $verification_code = bin2hex(random_bytes(16));
                $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                // Store verification code
                $stmt = $conn->prepare("INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES (?, ?, 'email', ?)");
                $stmt->bind_param("iss", $user['id'], $verification_code, $expires_at);
                $stmt->execute();
                
                echo json_encode([
                    'success' => false,
                    'requiresVerification' => true,
                    'email' => $user['email'],
                    'message' => 'Please verify your email before logging in'
                ]);
                exit();
            }
            
            // Generate JWT token (simplified for demo)
            $payload = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'exp' => time() + 3600 // Token expires in 1 hour
            ];
            
            $token = base64_encode(json_encode($payload));
            
            // Remove password from user data
            unset($user['password']);
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => $user,
                'message' => 'Login successful'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid credentials'
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