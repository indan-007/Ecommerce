<?php
// Deployment configuration
define('SITE_ROOT', dirname(__DIR__));
define('DEPLOY_LOG', SITE_ROOT . '/deployment/deploy.log');

// Function to log deployment messages
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents(DEPLOY_LOG, $logMessage, FILE_APPEND);
    echo $logMessage;
}

// Function to check system requirements
function checkRequirements() {
    $requirements = [
        'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0', '>='),
        'MySQL Extension' => extension_loaded('mysqli'),
        'PDO Extension' => extension_loaded('pdo'),
        'SSL Support' => extension_loaded('openssl'),
        'GD Library' => extension_loaded('gd'),
        'Curl Extension' => extension_loaded('curl')
    ];

    $pass = true;
    foreach ($requirements as $requirement => $satisfied) {
        if (!$satisfied) {
            logMessage("ERROR: $requirement not satisfied");
            $pass = false;
        }
    }
    return $pass;
}

// Function to setup database
function setupDatabase() {
    require_once SITE_ROOT . '/db_connect.php';
    
    try {
        // Create database if not exists
        $sql = file_get_contents(SITE_ROOT . '/database.sql');
        if ($conn->multi_query($sql)) {
            do {
                if ($result = $conn->store_result()) {
                    $result->free();
                }
            } while ($conn->next_result());
        }
        logMessage("Database setup completed successfully");
        return true;
    } catch (Exception $e) {
        logMessage("ERROR: Database setup failed: " . $e->getMessage());
        return false;
    }
}

// Function to optimize images
function optimizeImages() {
    $imageDir = SITE_ROOT . '/images';
    if (!is_dir($imageDir)) return;

    $images = glob($imageDir . '/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
    foreach ($images as $image) {
        if (function_exists('imagecreatefromjpeg')) {
            $info = getimagesize($image);
            if (!$info) continue;

            switch ($info[2]) {
                case IMAGETYPE_JPEG:
                    $img = imagecreatefromjpeg($image);
                    imagejpeg($img, $image, 85);
                    break;
                case IMAGETYPE_PNG:
                    $img = imagecreatefrompng($image);
                    imagepng($img, $image, 8);
                    break;
            }
            if (isset($img)) {
                imagedestroy($img);
            }
        }
    }
    logMessage("Image optimization completed");
}

// Main deployment process
try {
    logMessage("Starting deployment process...");

    if (!checkRequirements()) {
        throw new Exception("System requirements not met");
    }

    if (!setupDatabase()) {
        throw new Exception("Database setup failed");
    }

    optimizeImages();

    logMessage("Deployment completed successfully");
} catch (Exception $e) {
    logMessage("Deployment failed: " . $e->getMessage());
    exit(1);
} 