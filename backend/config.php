<?php


function loadEnv($path)
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Don't override existing environment variables
            if (!getenv($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Load .env file
loadEnv(__DIR__ . '/.env');

// Configuration constants
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'quizdb');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'change-this-secret-key');
define('JWT_EXPIRY', (int) (getenv('JWT_EXPIRY') ?: 3600));

define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'http://localhost:8080');

define('RATE_LIMIT_MAX_ATTEMPTS', (int) (getenv('RATE_LIMIT_MAX_ATTEMPTS') ?: 5));
define('RATE_LIMIT_WINDOW', (int) (getenv('RATE_LIMIT_WINDOW') ?: 300));

define('FROM_EMAIL', getenv('FROM_EMAIL') ?: 'no-reply@quizmaster.com');
