<?php
// backend/utils/validator.php
// Input validation and sanitization utilities

class Validator
{

    /**
     * Sanitize string input
     */
    public static function sanitizeString($input)
    {
        if ($input === null) {
            return '';
        }
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate and sanitize email
     */
    public static function validateEmail($email)
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $email;
        }
        return false;
    }

    /**
     * Validate phone number (basic)
     */
    public static function validatePhone($phone)
    {
        $phone = preg_replace('/[^0-9+\-\s()]/', '', $phone);
        if (strlen($phone) >= 8 && strlen($phone) <= 20) {
            return $phone;
        }
        return false;
    }

    /**
     * Validate integer
     */
    public static function validateInt($value, $min = null, $max = null)
    {
        if (!is_numeric($value)) {
            return false;
        }

        $value = (int) $value;

        if ($min !== null && $value < $min) {
            return false;
        }

        if ($max !== null && $value > $max) {
            return false;
        }

        return $value;
    }

    /**
     * Validate required field
     */
    public static function required($value)
    {
        return !empty($value) || $value === '0' || $value === 0;
    }

    /**
     * Validate string length
     */
    public static function validateLength($string, $min = 0, $max = PHP_INT_MAX)
    {
        $length = mb_strlen($string, 'UTF-8');
        return $length >= $min && $length <= $max;
    }

    /**
     * Validate password strength
     */
    public static function validatePassword($password)
    {
        // At least 8 characters
        if (strlen($password) < 8) {
            return false;
        }
        return true;
    }

    /**
     * Sanitize array of data
     */
    public static function sanitizeArray($data, $rules)
    {
        $sanitized = [];

        foreach ($rules as $field => $rule) {
            if (!isset($data[$field])) {
                $sanitized[$field] = null;
                continue;
            }

            switch ($rule) {
                case 'string':
                    $sanitized[$field] = self::sanitizeString($data[$field]);
                    break;
                case 'email':
                    $sanitized[$field] = self::validateEmail($data[$field]);
                    break;
                case 'phone':
                    $sanitized[$field] = self::validatePhone($data[$field]);
                    break;
                case 'int':
                    $sanitized[$field] = self::validateInt($data[$field]);
                    break;
                default:
                    $sanitized[$field] = $data[$field];
            }
        }

        return $sanitized;
    }
}
