<?php
// backend/api/login.php
header('Content-Type: application/json');

// Adjust this to match your production frontend origin
$origin = 'https://lightseagreen-alpaca-114967.hostingersite.com/';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require __DIR__ . '/../db.php';
session_start();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Missing credentials']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admins WHERE username = ?');
  $stmt->execute([$username]);
  $admin = $stmt->fetch();

  if (!$admin || !password_verify($password, $admin['password_hash'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Invalid credentials']);
    exit;
  }

  $_SESSION['admin_id'] = $admin['id'];
  $_SESSION['admin_username'] = $admin['username'];

  echo json_encode(['ok' => true, 'username' => $admin['username']]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server error']);
}
