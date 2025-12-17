<?php
// backend/api/login.php
header('Content-Type: application/json');
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../utils/jwt.php';
require __DIR__ . '/../utils/validator.php';
require __DIR__ . '/../utils/rate_limiter.php';

// Rate limiting
$rateLimiter = new RateLimiter();
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

if (!$rateLimiter->isAllowed('admin_login_' . $clientIp, RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW)) {
  http_response_code(429);
  echo json_encode([
    'error' => 'Too many login attempts. Please try again later.',
    'retryAfter' => RATE_LIMIT_WINDOW
  ]);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validate input
$username = Validator::sanitizeString($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!Validator::required($username) || !Validator::required($password)) {
  http_response_code(400);
  echo json_encode(['error' => 'Username and password are required']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admins WHERE username = ?');
  $stmt->execute([$username]);
  $admin = $stmt->fetch();

  if (!$admin || !password_verify($password, $admin['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
  }

  // Reset rate limit on successful login
  $rateLimiter->reset('admin_login_' . $clientIp);

  // Generate JWT token
  $payload = [
    'admin_id' => $admin['id'],
    'username' => $admin['username']
  ];

  $token = JWT::encode($payload, JWT_SECRET, JWT_EXPIRY);

  echo json_encode([
    'success' => true,
    'token' => $token,
    'expiresIn' => JWT_EXPIRY,
    'username' => $admin['username']
  ]);

} catch (PDOException $e) {
  error_log('Admin login error: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Server error']);
}
