<?php
// backend/api/student_login.php
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../utils/validator.php';

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$email = Validator::validateEmail($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !Validator::required($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email and password are required']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, name, email, phone, password FROM students WHERE email = ?');
    $stmt->execute([$email]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($student && password_verify($password, $student['password'])) {
        // Remove password from response
        unset($student['password']);

        // Generate JWT
        require_once __DIR__ . '/../utils/jwt.php';
        $token = JWT::encode([
            'id' => $student['id'],
            'email' => $student['email']
        ], JWT_SECRET);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'student' => $student
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }

} catch (Exception $e) {
    error_log('Student login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to login']);
}
?>