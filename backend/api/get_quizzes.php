<?php
require __DIR__ . '/../cors.php';




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


