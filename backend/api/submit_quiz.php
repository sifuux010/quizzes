<?php
// backend/api/submit_quiz.php
require __DIR__ . '/../cors.php';

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
        // Optional: Update wilaya if empty? Let's skip for now to keep it simple.
    } else {
        $insertStmt = $pdo->prepare('INSERT INTO students (name, email, phone, wilaya) VALUES (?, ?, ?, ?)');
        $insertStmt->execute([
            $data['student']['name'],
            $data['student']['email'],
            $data['student']['phone'],
            $data['student']['wilaya'] ?? null
        ]);
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
            'percentage' => round((float) $existing['score_percentage']),
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

    // 6. Send Email Notification
    $to = $data['student']['email'];
    $subject = "Quiz Submission Confirmation";
    $message = "Dear " . $data['student']['name'] . ",\n\n" .
        "Thank you for completing the Professional Assessment Test.\n\n" .
        "We have received your submission successfully. Our team will review your results and get back to you shortly.\n\n" .
        "Best regards,\nMinistry of Vocational Training and Education";

    $headers = "From: no-reply@quizmaster.com\r\n" .
        "Reply-To: contact@quizmaster.com\r\n" .
        "X-Mailer: PHP/" . phpversion();

    // Suppress warnings for local env without SMTP
    @mail($to, $subject, $message, $headers);

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
