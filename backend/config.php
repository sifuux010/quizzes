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

            // Remove quotes if present
            $value = trim($value, '"\'');

            // Don't override existing environment variables
            if (!isset($_ENV[$key])) {
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Load .env file
loadEnv(__DIR__ . '/.env');

// Helper function to get environment variables
function env($key, $default = null)
{
    return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

// Configuration constants
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', 'quizdb'));
define('DB_USER', env('DB_USER', 'quizdb'));
define('DB_PASS', env('DB_PASS', 'ikYp8mmXrSsFtzMw'));
define('JWT_SECRET', env('JWT_SECRET', 'change-this-secret-key'));
define('JWT_EXPIRY', (int) env('JWT_EXPIRY', 3600));
define('ALLOWED_ORIGIN', env('ALLOWED_ORIGIN', 'https://apc.takwin.dz'));
define('RATE_LIMIT_MAX_ATTEMPTS', (int) env('RATE_LIMIT_MAX_ATTEMPTS', 5));
define('RATE_LIMIT_WINDOW', (int) env('RATE_LIMIT_WINDOW', 300));
define('FROM_EMAIL', env('FROM_EMAIL', 'no-reply@quizmaster.com'));