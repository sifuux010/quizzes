<?php
// backend/check_data.php - Check if migration was successful
require __DIR__ . '/db.php';

echo "<h2>Database Data Check</h2>";

try {
    // Check quizzes table
    echo "<h3>Quizzes Table:</h3>";
    $stmt = $pdo->query('SELECT id, title, description, duration FROM quizzes');
    $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($quizzes)) {
        echo "No quizzes found in database.<br>";
        echo "<strong>You need to run the migration script!</strong><br>";
        echo "<a href='run_migration.php'>Click here to run migration</a><br>";
    } else {
        echo "Found " . count($quizzes) . " quizzes:<br>";
        foreach ($quizzes as $quiz) {
            echo "- ID: " . $quiz['id'] . ", Duration: " . $quiz['duration'] . "<br>";
        }
    }
    
    // Check questions table
    echo "<h3>Questions Table:</h3>";
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM questions');
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($count['count'] == 0) {
        echo "No questions found in database.<br>";
        echo "<strong>You need to run the migration script!</strong><br>";
        echo "<a href='run_migration.php'>Click here to run migration</a><br>";
    } else {
        echo "Found " . $count['count'] . " questions in database.<br>";
        
        // Show sample question
        $stmt = $pdo->query('SELECT id, quiz_id, question_text, options, correct_option_index FROM questions LIMIT 1');
        $question = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($question) {
            echo "<h4>Sample Question:</h4>";
            echo "Quiz ID: " . $question['quiz_id'] . "<br>";
            echo "Question Text: " . htmlspecialchars($question['question_text']) . "<br>";
            echo "Options: " . htmlspecialchars($question['options']) . "<br>";
            echo "Correct Index: " . $question['correct_option_index'] . "<br>";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
}
?>
