<?php
// backend/cors.php

// -------------------------------------------------------------------------
// CORS Configuration
// -------------------------------------------------------------------------
// Modify this variable to change the allowed frontend origin.

$ALLOWED_ORIGIN = 'http://localhost:8080';
// -------------------------------------------------------------------------

if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    // Allow requests from the configured origin, or localhost variations
    if ($origin === $ALLOWED_ORIGIN || strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Fallback to the configured origin
        header("Access-Control-Allow-Origin: $ALLOWED_ORIGIN");
    }
} else {
    // Fallback for non-browser requests or if origin not set
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}
