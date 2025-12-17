<?php
class RateLimiter
{
    private $storageDir;

    public function __construct($storageDir = null)
    {
        $this->storageDir = $storageDir ?: sys_get_temp_dir() . '/rate_limits';

        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0755, true);
        }
    }

    /**
     * Check if request is allowed
     * @param string $identifier - IP address or user identifier
     * @param int $maxAttempts - Maximum attempts allowed
     * @param int $windowSeconds - Time window in seconds
     * @return bool
     */
    public function isAllowed($identifier, $maxAttempts = 5, $windowSeconds = 300)
    {
        $key = $this->getKey($identifier);
        $file = $this->storageDir . '/' . $key;

        $now = time();
        $attempts = [];

        // Load existing attempts
        if (file_exists($file)) {
            $data = @file_get_contents($file);
            if ($data) {
                $attempts = json_decode($data, true) ?: [];
            }
        }

        // Filter out old attempts
        $attempts = array_filter($attempts, function ($timestamp) use ($now, $windowSeconds) {
            return ($now - $timestamp) < $windowSeconds;
        });

        // Check if limit exceeded
        if (count($attempts) >= $maxAttempts) {
            return false;
        }

        // Add current attempt
        $attempts[] = $now;

        // Save attempts
        @file_put_contents($file, json_encode($attempts));

        return true;
    }

    /**
     * Reset rate limit for identifier
     */
    public function reset($identifier)
    {
        $key = $this->getKey($identifier);
        $file = $this->storageDir . '/' . $key;

        if (file_exists($file)) {
            @unlink($file);
        }
    }

    /**
     * Get remaining attempts
     */
    public function getRemainingAttempts($identifier, $maxAttempts = 5, $windowSeconds = 300)
    {
        $key = $this->getKey($identifier);
        $file = $this->storageDir . '/' . $key;

        $now = time();
        $attempts = [];

        if (file_exists($file)) {
            $data = @file_get_contents($file);
            if ($data) {
                $attempts = json_decode($data, true) ?: [];
            }
        }

        // Filter out old attempts
        $attempts = array_filter($attempts, function ($timestamp) use ($now, $windowSeconds) {
            return ($now - $timestamp) < $windowSeconds;
        });

        return max(0, $maxAttempts - count($attempts));
    }

    private function getKey($identifier)
    {
        return md5($identifier);
    }

    /**
     * Clean up old rate limit files
     */
    public function cleanup($olderThanSeconds = 3600)
    {
        $now = time();
        $files = glob($this->storageDir . '/*');

        foreach ($files as $file) {
            if (is_file($file) && ($now - filemtime($file)) > $olderThanSeconds) {
                @unlink($file);
            }
        }
    }
}
