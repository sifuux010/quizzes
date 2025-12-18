<?php
// backend/api/submit_quiz.php
require __DIR__ . '/../cors.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../utils/validator.php';

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($data['student']) || empty($data['quizId']) || !isset($data['answers']) || !isset($data['startTime'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required data']);
    exit;
}

// Sanitize and validate student data
$studentName = Validator::sanitizeString($data['student']['name'] ?? '');
$studentEmail = Validator::validateEmail($data['student']['email'] ?? '');
$studentPhone = Validator::validatePhone($data['student']['phone'] ?? '');
$studentWilaya = Validator::sanitizeString($data['student']['wilaya'] ?? '');

if (!Validator::required($studentName) || !Validator::validateLength($studentName, 2, 100)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid student name is required (2-100 characters)']);
    exit;
}

// Validate quiz ID
$quizId = Validator::sanitizeString($data['quizId']);
if (empty($quizId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid quiz ID']);
    exit;
}

// Validate answers array
if (!is_array($data['answers']) || count($data['answers']) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid answers data']);
    exit;
}

$pdo->beginTransaction();

try {
    // 1. Create or find the student
    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE name = ? AND email = ?');
    $studentStmt->execute([$studentName, $studentEmail ?: '']);
    $student = $studentStmt->fetch();

    if ($student) {
        $studentId = $student['id'];
    } else {
        $insertStmt = $pdo->prepare('INSERT INTO students (name, email, phone, wilaya) VALUES (?, ?, ?, ?)');
        $insertStmt->execute([
            $studentName,
            $studentEmail ?: '',
            $studentPhone ?: '',
            $studentWilaya ?: null
        ]);
        $studentId = $pdo->lastInsertId();
    }

    // 2. Check for existing attempt
    $existingAttemptStmt = $pdo->prepare('SELECT id, score_percentage FROM quiz_attempts WHERE student_id = ? AND quiz_id = ? LIMIT 1');
    $existingAttemptStmt->execute([$studentId, $quizId]);
    $existing = $existingAttemptStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $pdo->commit();
        echo json_encode([
            'success' => true,
            'alreadyAttempted' => true,
            'attemptId' => $existing['id'],
            'percentage' => round((float) $existing['score_percentage']),
        ]);
        exit;
    }

    // 3. Calculate score
    $score = 0;
    $totalQuestions = count($data['answers']);

    foreach ($data['answers'] as $answer) {
        // Validate each answer structure
        if (!isset($answer['questionId']) || !isset($answer['selectedOptionIndex']) || !isset($answer['isCorrect'])) {
            throw new Exception('Invalid answer format');
        }

        if ($answer['isCorrect']) {
            $score++;
        }
    }

    $percentage = ($totalQuestions > 0) ? ($score / $totalQuestions) * 100 : 0;

    // 4. Create quiz attempt
    $startTime = Validator::validateInt($data['startTime'], 0);
    if ($startTime === false) {
        throw new Exception('Invalid start time');
    }

    $startedAt = date('Y-m-d H:i:s', $startTime / 1000);
    $completedAt = date('Y-m-d H:i:s');

    $attemptStmt = $pdo->prepare('INSERT INTO quiz_attempts (student_id, quiz_id, score_percentage, started_at, completed_at) VALUES (?, ?, ?, ?, ?)');
    $attemptStmt->execute([$studentId, $quizId, $percentage, $startedAt, $completedAt]);
    $attemptId = $pdo->lastInsertId();

    // 5. Insert student answers
    $answerStmt = $pdo->prepare('INSERT INTO student_answers (attempt_id, question_id, selected_option_index, is_correct) VALUES (?, ?, ?, ?)');

    foreach ($data['answers'] as $answer) {
        $questionId = Validator::validateInt($answer['questionId'], 1);
        $selectedIndex = Validator::validateInt($answer['selectedOptionIndex'], -1);
        $isCorrect = (bool) $answer['isCorrect'];

        if ($questionId === false || $selectedIndex === false) {
            throw new Exception('Invalid answer data');
        }

        $answerStmt->execute([
            $attemptId,
            $questionId,
            $selectedIndex,
            $isCorrect,
        ]);
    }

    $pdo->commit();

    // 6. Send email notification (if email provided)
    if ($studentEmail) {
        $to = $studentEmail;
        $subject = "Quiz Submission Confirmation";
        $message = "Dear " . $studentName . ",\n\n" .
            "Thank you for completing the Professional Assessment Test.\n\n" .
            "We have received your submission successfully. Our team will review your results and get back to you shortly.\n\n" .
            "Best regards,\nMinistry of Vocational Training and Education";

        $headers = "From: " . FROM_EMAIL . "\r\n" .
            "Reply-To: " . FROM_EMAIL . "\r\n" .
            "X-Mailer: PHP/" . phpversion();

        // Suppress warnings for local env without SMTP
        @mail($to, $subject, $message, $headers);
    }

    echo json_encode([
        'success' => true,
        'attemptId' => $attemptId,
        'score' => $score,
        'total' => $totalQuestions,
        'percentage' => round($percentage)
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log('Quiz submission error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit quiz']);
}
