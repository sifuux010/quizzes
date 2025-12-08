<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lightseagreen-alpaca-114967.hostingersite.com/');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }


require __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query('SELECT id, title, description, duration FROM quizzes');
    $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode the JSON fields for cleaner output
    foreach ($quizzes as &$quiz) {
        $quiz['title'] = json_decode($quiz['title'], true);
        $quiz['description'] = json_decode($quiz['description'], true);
    }

    echo json_encode($quizzes);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch quizzes: ' . $e->getMessage()]);
}
