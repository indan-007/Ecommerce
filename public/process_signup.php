<?php
// Include database connection
require_once '../db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if the form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form data and sanitize
    $username = clean_input($_POST['username'] ?? '');
    $email = clean_input($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';  // Will be hashed, no need to clean
    $phone_number = clean_input($_POST['phone_number'] ?? '');
    $address = clean_input($_POST['address'] ?? '');
    
    // Set full_name to username if not provided
    $full_name = $username;
    
    // Validate data
    $errors = [];
    
    if (empty($username)) {
        $errors[] = "Username is required";
    } elseif (strlen($username) < 3) {
        $errors[] = "Username must be at least 3 characters";
    }
    
    if (empty($email)) {
        $errors[] = "Email is required";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }
    
    if (empty($password)) {
        $errors[] = "Password is required";
    } elseif (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters";
    }
    
    // Check if username or email already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            if ($row['username'] == $username) {
                $errors[] = "Username already taken";
            }
            if ($row['email'] == $email) {
                $errors[] = "Email already registered";
            }
        }
    }
    
    // If there are validation errors, return them
    if (!empty($errors)) {
        echo json_encode([
            'success' => false,
            'message' => implode(", ", $errors)
        ]);
        exit;
    }
    
    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Generate a verification code
    $verification_code = rand(100000, 999999);
    
    // Insert user data
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, full_name, phone_number, address) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $username, $email, $hashed_password, $full_name, $phone_number, $address);
    
    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        
        // Insert verification code
        $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));
        $stmt = $conn->prepare("INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES (?, ?, 'email_verification', ?)");
        $stmt->bind_param("iss", $user_id, $verification_code, $expires_at);
        $stmt->execute();
        
        // Success response with verification code for development
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully! Please check your email for verification.',
            'verificationCode' => $verification_code,
            'userId' => $user_id
        ]);
        
        // In a production environment, you would send an email with the verification code
        // sendVerificationEmail($email, $verification_code);
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error creating account: ' . $stmt->error
        ]);
    }
    
} else {
    // Not a POST request
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?> 