<?php
// backend/api/submit_quiz.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lightseagreen-alpaca-114967.hostingersite.com/');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (empty($data['student']) || empty($data['quizId']) || !isset($data['answers']) || !isset($data['startTime'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required data: student, quizId, and answers are required.']);
    exit;
}

$pdo->beginTransaction();

try {
    // 1. Create or find the student
    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE name = ? AND email = ?');
    $studentStmt->execute([$data['student']['name'], $data['student']['email']]);
    $student = $studentStmt->fetch();

    if ($student) {
        $studentId = $student['id'];
    } else {
        $insertStudentStmt = $pdo->prepare('INSERT INTO students (name, email, phone) VALUES (?, ?, ?)');
        $insertStudentStmt->execute([$data['student']['name'], $data['student']['email'], $data['student']['phone']]);
        $studentId = $pdo->lastInsertId();
    }

    // 2. If the student has already attempted this quiz, do not count again
    $existingAttemptStmt = $pdo->prepare('SELECT id, score_percentage, started_at, completed_at FROM quiz_attempts WHERE student_id = ? AND quiz_id = ? LIMIT 1');
    $existingAttemptStmt->execute([$studentId, $data['quizId']]);
    $existing = $existingAttemptStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // No new insert; return existing attempt info and flag
        $pdo->commit();
        echo json_encode([
            'ok' => true,
            'alreadyAttempted' => true,
            'attemptId' => $existing['id'],
            'percentage' => round((float)$existing['score_percentage']),
        ]);
        exit;
    }

    // 3. Calculate the score
    $score = 0;
    $totalQuestions = count($data['answers']);
    foreach ($data['answers'] as $answer) {
        if ($answer['isCorrect']) {
            $score++;
        }
    }
    $percentage = ($totalQuestions > 0) ? ($score / $totalQuestions) * 100 : 0;

    // 4. Create the quiz attempt
    $startedAt = date('Y-m-d H:i:s', $data['startTime'] / 1000); // Convert JS timestamp
    $completedAt = date('Y-m-d H:i:s');

    $attemptStmt = $pdo->prepare('INSERT INTO quiz_attempts (student_id, quiz_id, score_percentage, started_at, completed_at) VALUES (?, ?, ?, ?, ?)');
    $attemptStmt->execute([$studentId, $data['quizId'], $percentage, $startedAt, $completedAt]);
    $attemptId = $pdo->lastInsertId();

    // 5. Insert each student answer
    $answerStmt = $pdo->prepare('INSERT INTO student_answers (attempt_id, question_id, selected_option_index, is_correct) VALUES (?, ?, ?, ?)');
    foreach ($data['answers'] as $answer) {
        $answerStmt->execute([
            $attemptId,
            $answer['questionId'],
            $answer['selectedOptionIndex'],
            $answer['isCorrect'],
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'ok' => true, 
        'attemptId' => $attemptId, 
        'score' => $score,
        'total' => $totalQuestions,
        'percentage' => round($percentage)
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit quiz: ' . $e->getMessage()]);
}
