<?php
// backend/api/get_students.php
require __DIR__ . '/../cors.php';
require __DIR__ . '/../middleware/auth_admin.php'; // JWT authentication
require __DIR__ . '/../db.php';

$quizId = $_GET['quiz_id'] ?? null;

try {
    $params = [];
    $quizFilterSql = '';

    if ($quizId && $quizId !== 'all') {
        $quizFilterSql = 'AND qa.quiz_id = ?';
        $params[] = $quizId;
    }

    $sql = "
        SELECT 
            s.id, 
            s.name, 
            s.email, 
            s.phone, 
            s.created_at,
            s.password IS NOT NULL as has_account,
            COUNT(DISTINCT qa.id) as attempts_count,
            AVG(qa.score_percentage) as avg_score,
            MAX(qa.completed_at) as last_attempt,
            (SELECT COUNT(sa.id) 
             FROM student_answers sa 
             JOIN quiz_attempts qa2 ON sa.attempt_id = qa2.id 
             WHERE qa2.student_id = s.id AND sa.is_correct = 1 
             " . ($quizId && $quizId !== 'all' ? "AND qa2.quiz_id = ?" : "") . "
            ) as total_correct_answers
        FROM students s
        LEFT JOIN quiz_attempts qa ON s.id = qa.student_id
        WHERE qa.id IS NOT NULL " . $quizFilterSql . "
        GROUP BY s.id
        ORDER BY s.created_at DESC
    ";

    if ($quizId && $quizId !== 'all') {
        $params[] = $quizId; // Add it again for the subquery
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($students);

} catch (Exception $e) {
    error_log('Get students error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch students']);
}
