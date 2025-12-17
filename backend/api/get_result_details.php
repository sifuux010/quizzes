<?php
// backend/api/get_result_details.php
require __DIR__ . '/../cors.php';
require __DIR__ . '/../middleware/auth_admin.php'; // JWT authentication
require __DIR__ . '/../db.php';
require __DIR__ . '/../utils/validator.php';

// Validate attempt ID
$attemptId = Validator::validateInt($_GET['id'] ?? '', 1);
if ($attemptId === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid attempt ID is required']);
    exit;
}

try {
    // 1. Fetch attempt info
    $attemptStmt = $pdo->prepare('
        SELECT 
            qa.id, 
            qa.score_percentage, 
            qa.completed_at, 
            s.name AS student_name, 
            q.title AS quiz_title 
        FROM quiz_attempts qa
        JOIN students s ON qa.student_id = s.id
        JOIN quizzes q ON qa.quiz_id = q.id
        WHERE qa.id = ?
    ');
    $attemptStmt->execute([$attemptId]);
    $attempt = $attemptStmt->fetch(PDO::FETCH_ASSOC);

    if (!$attempt) {
        http_response_code(404);
        echo json_encode(['error' => 'Attempt not found']);
        exit;
    }

    // 2. Fetch student answers
    $answersStmt = $pdo->prepare('
        SELECT 
            q.id AS question_id,
            q.question_text,
            q.options,
            q.correct_option_index,
            sa.selected_option_index,
            sa.is_correct
        FROM student_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.attempt_id = ?
    ');
    $answersStmt->execute([$attemptId]);
    $answers = $answersStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Decode JSON fields
    $attempt['quiz_title'] = json_decode($attempt['quiz_title'], true);

    foreach ($answers as &$answer) {
        $answer['question_text'] = json_decode($answer['question_text'], true);
        $answer['options'] = json_decode($answer['options'], true);
    }

    // 4. Attach details
    $attempt['details'] = $answers;

    echo json_encode($attempt);

} catch (Exception $e) {
    error_log('Get result details error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch result details']);
}
