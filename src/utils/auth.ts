// src/utils/auth.ts
// Authentication utilities for JWT token management

/**
 * Get authorization headers with JWT token
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

/**
 * Check if the JWT token has expired
 */
export const isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;

    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();

    // Add 5 minute buffer before actual expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    return currentTime >= (expiryTime - bufferTime);
};

/**
 * Get remaining time until token expires (in seconds)
 */
export const getTokenRemainingTime = (): number => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return 0;

    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    const remaining = Math.max(0, expiryTime - currentTime);

    return Math.floor(remaining / 1000); // Convert to seconds
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('adminToken');
    return !!token && !isTokenExpired();
};

/**
 * Logout and clear all auth data
 */
export const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('isAdminLoggedIn');
};

/**
 * Get stored admin username
 */
export const getAdminUsername = (): string | null => {
    return localStorage.getItem('adminUsername');
};
