<?php
// backend/api/get_dashboard_stats.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lightseagreen-alpaca-114967.hostingersite.com/');
header('Access-Control-Allow-Credentials: true');

require __DIR__ . '/../db.php';

try {
    $stats = [];

    // 1. General counts
    $stats['total_students'] = $pdo->query('SELECT COUNT(*) FROM students')->fetchColumn();
    $stats['total_quizzes_available'] = $pdo->query('SELECT COUNT(*) FROM quizzes')->fetchColumn();
    $stats['total_attempts'] = $pdo->query('SELECT COUNT(*) FROM quiz_attempts')->fetchColumn();

    // 2. Average score
    $stats['average_score'] = $pdo->query('SELECT AVG(score_percentage) FROM quiz_attempts')->fetchColumn() ?: 0;

    // 3. Performance levels
    $stats['performance_levels'] = [
        'excellent' => $pdo->query('SELECT COUNT(*) FROM quiz_attempts WHERE score_percentage >= 90')->fetchColumn(),
        'good' => $pdo->query('SELECT COUNT(*) FROM quiz_attempts WHERE score_percentage >= 70 AND score_percentage < 90')->fetchColumn(),
        'average' => $pdo->query('SELECT COUNT(*) FROM quiz_attempts WHERE score_percentage >= 50 AND score_percentage < 70')->fetchColumn(),
        'needs_improvement' => $pdo->query('SELECT COUNT(*) FROM quiz_attempts WHERE score_percentage < 50')->fetchColumn(),
    ];

    // 4. Quiz distribution
    $distStmt = $pdo->query('SELECT q.title, COUNT(qa.id) as attempt_count FROM quizzes q JOIN quiz_attempts qa ON q.id = qa.quiz_id GROUP BY q.id');
    $stats['quiz_distribution'] = $distStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($stats['quiz_distribution'] as &$dist) {
        $dist['title'] = json_decode($dist['title'], true);
    }

    // 5. Recent performance (last 10 attempts)
    $perfStmt = $pdo->query('SELECT qa.score_percentage, qa.completed_at, q.title FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id ORDER BY qa.completed_at DESC LIMIT 10');
    $stats['recent_performance'] = $perfStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($stats['recent_performance'] as &$perf) {
        $perf['title'] = json_decode($perf['title'], true);
    }

    // 6. Top 5 students by average score
    $topStmt = $pdo->query('SELECT s.id, s.name, AVG(qa.score_percentage) as avg_score FROM students s JOIN quiz_attempts qa ON s.id = qa.student_id GROUP BY s.id ORDER BY avg_score DESC LIMIT 5');
    $stats['top_students'] = $topStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($stats);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch dashboard stats: ' . $e->getMessage()]);
}
