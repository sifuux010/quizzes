<?php
// backend/api/get_student_stats.php
require __DIR__ . '/../cors.php';

require __DIR__ . '/../db.php';

$email = $_GET['email'] ?? '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit;
}

try {
    // Get student ID
    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE email = ?');
    $studentStmt->execute([$email]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode([
            'totalCompleted' => 0,
            'avgScore' => 0
        ]);
        exit;
    }

    // Get statistics (only first attempt per quiz counts)
    $statsStmt = $pdo->prepare('
        SELECT 
            COUNT(*) AS total_completed,
            ROUND(AVG(t.score_percentage), 1) AS avg_score
        FROM (
            SELECT qa.*
            FROM quiz_attempts qa
            INNER JOIN (
                SELECT quiz_id, MIN(completed_at) AS first_attempt_time
                FROM quiz_attempts
                WHERE student_id = ?
                GROUP BY quiz_id
            ) fa ON qa.quiz_id = fa.quiz_id AND qa.completed_at = fa.first_attempt_time
        ) t
    ');
    $statsStmt->execute([$student['id']]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'totalCompleted' => (int) $stats['total_completed'],
        'avgScore' => (float) ($stats['avg_score'] ?? 0)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch stats: ' . $e->getMessage()]);
}