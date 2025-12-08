<?php
// backend/db.php
$DB_HOST = 'mysql.hostinger.com';
$DB_NAME = 'u204363910_quize';
$DB_USER = 'u204363910_sifesalah366';
$DB_PASS = 'AdamMoh10&';

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['ok' => false, 'error' => 'DB connection failed']);
  exit;
}