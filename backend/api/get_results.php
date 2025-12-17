<?php
// backend/api/get_results.php
require __DIR__ . '/../cors.php';
require __DIR__ . '/../middleware/auth_admin.php'; // JWT authentication
require __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query(
        'SELECT
            qa.id,
            qa.score_percentage,
            qa.completed_at,
            s.name AS student_name,
            s.email AS student_email,
            s.phone AS student_phone,
            s.wilaya AS student_wilaya,
            s.password IS NOT NULL AS has_account,
            q.id AS quiz_id,
            q.title AS quiz_title,
            (SELECT COUNT(*) FROM student_answers sa WHERE sa.attempt_id = qa.id AND sa.is_correct = 1) AS correct_answers,
            (SELECT COUNT(*) FROM student_answers sa WHERE sa.attempt_id = qa.id) AS total_questions,
            TIMESTAMPDIFF(SECOND, qa.started_at, qa.completed_at) AS time_taken_seconds
        FROM quiz_attempts qa
        INNER JOIN (
            SELECT student_id, quiz_id, MIN(id) AS first_id
            FROM quiz_attempts
            GROUP BY student_id, quiz_id
        ) fa ON qa.id = fa.first_id
        JOIN students s ON qa.student_id = s.id
        JOIN quizzes q ON qa.quiz_id = q.id
        ORDER BY qa.completed_at DESC'
    );
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode the JSON title field
    foreach ($results as &$result) {
        $result['quiz_title'] = json_decode($result['quiz_title'], true);
    }

    echo json_encode($results);

} catch (Exception $e) {
    error_log('Get results error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch results']);
}
