<?php
// backend/api/get_quiz.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin:https://lightseagreen-alpaca-114967.hostingersite.com/');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require __DIR__ . '/../db.php';

$quizId = $_GET['id'] ?? '';

if (empty($quizId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Quiz ID is required']);
    exit;
}

try {
    // Fetch the quiz details
    $quizStmt = $pdo->prepare('SELECT id, title, description, duration FROM quizzes WHERE id = ?');
    $quizStmt->execute([$quizId]);
    $quiz = $quizStmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        http_response_code(404);
        echo json_encode(['error' => 'Quiz not found']);
        exit;
    }

    // Fetch the questions for the quiz
    $questionStmt = $pdo->prepare('SELECT id, question_text, options, correct_option_index FROM questions WHERE quiz_id = ?');
    $questionStmt->execute([$quizId]);
    $questions = $questionStmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON fields
    $quiz['title'] = json_decode($quiz['title'], true);
    $quiz['description'] = json_decode($quiz['description'], true);

    foreach ($questions as &$question) {
        $question['question_text'] = json_decode($question['question_text'], true);
        $question['options'] = json_decode($question['options'], true);
    }

    $quiz['questions'] = $questions;

    echo json_encode($quiz);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch quiz: ' . $e->getMessage()]);
}
