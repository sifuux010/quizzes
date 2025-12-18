<?php
// backend/cors.php
require_once __DIR__ . '/config.php';

// -------------------------------------------------------------------------
// CORS Configuration with Security Headers
// -------------------------------------------------------------------------

$allowedOrigins = [
    ALLOWED_ORIGIN,
    'https://apc.takwin.dz'
];

// CORS Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];

    // Only allow whitelisted origins
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Reject requests from unknown origins
        header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
    }
} else {
    // Default to configured origin (no wildcard)
    header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Content-Type: application/json; charset=utf-8');

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// Prevent caching of sensitive data
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}
