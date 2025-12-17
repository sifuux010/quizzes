<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/jwt.php';

@ini_set('display_errors', '0');
@ini_set('log_errors', '1');


function verifyAdminToken()
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: No token provided']);
        exit;
    }

    if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid token format']);
        exit;
    }

    $payload = JWT::decode($token, JWT_SECRET);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid or expired token']);
        exit;
    }

    if (!isset($payload['admin_id']) || !isset($payload['username'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid token payload']);
        exit;
    }

    return $payload;
}

$adminData = verifyAdminToken();
