<?php
require_once 'db_connect.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get payment method
    $payment_method = $_POST['payment_method'];
    
    // Initialize variables
    $card_number = null;
    $bank_name = null;
    $upi_id = null;
    $emi_option = null;
    $order_id = uniqid('ORD'); // Generate unique order ID
    $payment_status = 'pending';
    $timestamp = date('Y-m-d H:i:s');

    // Process different payment methods
    switch($payment_method) {
        case 'card':
            $card_number = $_POST['card_number'];
            // Only store last 4 digits for security
            $card_number = substr($card_number, -4);
            break;
            
        case 'netbanking':
            $bank_name = $_POST['bank_name'];
            break;
            
        case 'upi':
            $upi_id = $_POST['upi_id'];
            break;
            
        case 'emi':
            $emi_option = $_POST['emi_option'];
            break;
            
        case 'cod':
            $payment_status = 'cod_pending';
            break;
    }

    // Prepare SQL statement
    $sql = "INSERT INTO payments (
        order_id, 
        payment_method, 
        card_number, 
        bank_name, 
        upi_id, 
        emi_option, 
        payment_status, 
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    // Create prepared statement
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        // Bind parameters
        $stmt->bind_param("ssssssss", 
            $order_id,
            $payment_method,
            $card_number,
            $bank_name,
            $upi_id,
            $emi_option,
            $payment_status,
            $timestamp
        );

        // Execute the statement
        if ($stmt->execute()) {
            $response = [
                'status' => 'success',
                'message' => 'Payment information stored successfully',
                'order_id' => $order_id
            ];
        } else {
            $response = [
                'status' => 'error',
                'message' => 'Error storing payment information: ' . $stmt->error
            ];
        }

        $stmt->close();
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Error preparing statement: ' . $conn->error
        ];
    }

    // Send JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?> 