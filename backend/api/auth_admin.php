<?php
// backend/api/auth_admin.php
// Guard for admin-only endpoints. Ensures consistent JSON errors and no HTML notices leak.

// Never display errors to clients; log instead (configure php.ini for error_log path)
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

require __DIR__ . '/../cors.php';

// Simple session-based admin check
if (!isset($_SESSION['admin_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized: admin session required']);
  exit;
}
