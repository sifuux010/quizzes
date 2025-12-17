<?php
require __DIR__ . '/../db.php';

try {
    echo "Adding wilaya column to students table...\n";

    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM students LIKE 'wilaya'");
    if ($stmt->fetch()) {
        echo "Column 'wilaya' already exists.\n";
    } else {
        $pdo->exec("ALTER TABLE students ADD COLUMN wilaya VARCHAR(50) AFTER phone");
        echo "Column 'wilaya' added successfully.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>