<?php
// backend/api/sync_quiz.php

require __DIR__ . '/../cors.php';

require __DIR__ . '/../db.php';

// Path to the JSON file
$jsonFilePath = __DIR__ . '/../../src/data/quizzes/cba-assessment.json';

if (!file_exists($jsonFilePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Quiz JSON file not found at: ' . $jsonFilePath]);
    exit;
}

$jsonData = file_get_contents($jsonFilePath);
$quizData = json_decode($jsonData, true);

if (!$quizData) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to decode JSON data']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Update or Insert the Quiz
    $stmt = $pdo->prepare("
        INSERT INTO quizzes (id, title, description, duration) 
        VALUES (:id, :title, :description, :duration)
        ON DUPLICATE KEY UPDATE 
            title = VALUES(title), 
            description = VALUES(description), 
            duration = VALUES(duration)
    ");

    $stmt->execute([
        ':id' => $quizData['id'],
        ':title' => json_encode($quizData['title'], JSON_UNESCAPED_UNICODE),
        ':description' => json_encode($quizData['description'], JSON_UNESCAPED_UNICODE),
        ':duration' => $quizData['duration']
    ]);

    // 2. Clear existing questions for this quiz (to ensure full sync)
    $deleteStmt = $pdo->prepare("DELETE FROM questions WHERE quiz_id = :quiz_id");
    $deleteStmt->execute([':quiz_id' => $quizData['id']]);

    // 3. Insert Questions
    // The JSON is structured by "sections", we need to flatten them if the DB doesn't support sections.
    // Based on get_quiz.php, the DB 'questions' table links directly to 'quiz_id'.
    // We will iterate sections and then questions.

    $insertQuestionStmt = $pdo->prepare("
        INSERT INTO questions (id, quiz_id, question_text, options, correct_option_index) 
        VALUES (:id, :quiz_id, :question_text, :options, :correct_option_index)
    ");

    $count = 0;

    if (isset($quizData['sections']) && is_array($quizData['sections'])) {
        foreach ($quizData['sections'] as $section) {
            if (isset($section['questions']) && is_array($section['questions'])) {
                foreach ($section['questions'] as $q) {
                    $insertQuestionStmt->execute([
                        ':id' => $q['id'], // Use the string ID from JSON (e.g. "A1")
                        ':quiz_id' => $quizData['id'],
                        ':question_text' => json_encode($q['question'], JSON_UNESCAPED_UNICODE),
                        ':options' => json_encode($q['options'], JSON_UNESCAPED_UNICODE),
                        ':correct_option_index' => $q['correctAnswer']
                    ]);
                    $count++;
                }
            }
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Quiz '{$quizData['id']}' synchronized successfully.",
        'questions_imported' => $count
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
