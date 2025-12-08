<?php
// backend/seed_admin.php
require __DIR__ . '/db.php';

function is_strong_password(string $pw): bool {
  if (strlen($pw) < 10) return false;
  if (!preg_match('/[A-Z]/', $pw)) return false;
  if (!preg_match('/[a-z]/', $pw)) return false;
  if (!preg_match('/[0-9]/', $pw)) return false;
  if (!preg_match('/[^A-Za-z0-9]/', $pw)) return false;
  return true;
}

$username = $argv[1] ?? null;
$plain = $argv[2] ?? null;

if (!$username || !$plain) {
  echo "Usage: php backend/seed_admin.php <username> <password>\n";
  exit(1);
}

if (!is_strong_password($plain)) {
  echo "Password not strong enough. Min 10 chars incl upper, lower, digit, special.\n";
  exit(1);
}

try {
  $stmt = $pdo->prepare('SELECT id FROM admins WHERE username = ?');
  $stmt->execute([$username]);
  if ($stmt->fetch()) {
    echo "Username already exists.\n";
    exit(1);
  }

  $hash = password_hash($plain, PASSWORD_BCRYPT);
  $ins = $pdo->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
  $ins->execute([$username, $hash]);

  echo "Admin created: {$username}\n";
} catch (PDOException $e) {
  echo "Error: " . $e->getMessage() . "\n";
  exit(1);
}
