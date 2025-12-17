<?php
// backend/api/student_signup.php
require __DIR__ . '/../cors.php';

require __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and password are required']);
    exit;
}

try {
    $name = $data['name'];
    $email = $data['email'];
    $phone = $data['phone'] ?? null;
    $password = $data['password'];

    // Check if email already exists
    $checkStmt = $pdo->prepare('SELECT id FROM students WHERE email = ?');
    $checkStmt->execute([$email]);

    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new student
    $insertStmt = $pdo->prepare('INSERT INTO students (name, email, phone, password, wilaya) VALUES (?, ?, ?, ?, ?)');
    $wilaya = !empty($data['wilaya']) ? $data['wilaya'] : null;
    $insertStmt->execute([$name, $email, $phone, $hashedPassword, $wilaya]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Student registered successfully',
        'student' => [
            'id' => $pdo->lastInsertId(),
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'wilaya' => $wilaya
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to register student: ' . $e->getMessage()]);
}
?>