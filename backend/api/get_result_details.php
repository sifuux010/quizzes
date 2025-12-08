<?php
// backend/api/get_result_details.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin:https://lightseagreen-alpaca-114967.hostingersite.com/');
header('Access-Control-Allow-Credentials: true');

require __DIR__ . '/../db.php';

// ✅ Enable PHP error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ Read and validate the attempt ID
$attemptId = $_GET['id'] ?? '';
if (empty($attemptId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Attempt ID is required']);
    exit;
}

// ✅ Start debug tracking
$debug = [
    'received_attempt_id' => $attemptId,
    'steps' => []
];

try {
    // 1️⃣ Fetch attempt info (quiz, student, score, etc.)
    $debug['steps'][] = 'Fetching attempt info...';

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

    $debug['attempt_found'] = (bool) $attempt;
    $debug['attempt_raw'] = $attempt;

    if (!$attempt) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Attempt not found',
            'debug' => $debug
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // 2️⃣ Fetch student answers and related questions
    $debug['steps'][] = 'Fetching student answers...';

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

    $debug['answers_count'] = count($answers);
    $debug['answers_sample'] = array_slice($answers, 0, 2);

    // 3️⃣ Decode multilingual JSON fields safely
    $debug['steps'][] = 'Decoding JSON fields...';

    $attempt['quiz_title'] = json_decode($attempt['quiz_title'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $debug['quiz_title_json_error'] = json_last_error_msg();
    }

    foreach ($answers as &$answer) {
        // Decode question text
        $answer['question_text'] = json_decode($answer['question_text'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $debug['json_error_question'][] = [
                'question_id' => $answer['question_id'],
                'field' => 'question_text',
                'error' => json_last_error_msg()
            ];
        }

        // Decode options
        $answer['options'] = json_decode($answer['options'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $debug['json_error_options'][] = [
                'question_id' => $answer['question_id'],
                'field' => 'options',
                'error' => json_last_error_msg()
            ];
        }
    }

    // 4️⃣ Attach details
    $attempt['details'] = $answers;

    // ✅ Return final formatted response
    echo json_encode([
        'attempt' => $attempt,
        'debug' => $debug
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch result details',
        'message' => $e->getMessage(),
        'debug' => $debug
    ], JSON_PRETTY_PRINT);
}
