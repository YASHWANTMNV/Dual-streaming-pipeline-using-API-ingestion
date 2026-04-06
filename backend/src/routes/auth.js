// src/routes/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication Routes
// Login, logout, session management, and user info
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const {
    DEFAULT_CREDENTIALS,
    validateCredentials,
    generateSessionToken,
    validateSessionToken,
    invalidateSession,
    getSessionInfo,
    getActiveSessions,
} = require('../config/auth');

/**
 * @route   POST /auth/login
 * @desc    User login with credentials
 * @body    {string} username - Username
 * @body    {string} password - Password
 * @returns {Object} User data with session token
 */
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return sendValidationError(res, 'Username and password are required');
        }

        const validation = validateCredentials(username, password);
        if (!validation.valid) {
            console.warn(`❌ Failed login attempt for user: ${username}`);
            return sendError(res, validation.error, 401, 'INVALID_CREDENTIALS');
        }

        // Generate session token
        const token = generateSessionToken(validation.user);

        console.log(`✅ User logged in: ${username}`);
        return sendSuccess(res, {
            user: validation.user,
            token,
            expiresIn: '24h',
        }, 'Login successful', 200);
    } catch (err) {
        console.error('❌ Login error:', err.message);
        sendError(res, 'Login failed', 500, 'LOGIN_ERROR');
    }
});

/**
 * @route   POST /auth/logout
 * @desc    User logout
 * @header  {string} Authorization - Bearer token
 * @returns {Object} Logout confirmation
 */
router.post('/logout', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return sendError(res, 'No token provided', 400, 'NO_TOKEN');
        }

        invalidateSession(token);
        console.log('✅ User logged out');
        return sendSuccess(res, {}, 'Logout successful');
    } catch (err) {
        console.error('❌ Logout error:', err.message);
        sendError(res, 'Logout failed', 500, 'LOGOUT_ERROR');
    }
});

/**
 * @route   GET /auth/me
 * @desc    Get current user info
 * @header  {string} Authorization - Bearer token
 * @returns {Object} Current user data
 */
router.get('/me', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return sendError(res, 'No token provided', 401, 'NO_TOKEN');
        }

        const validation = validateSessionToken(token);
        if (!validation.valid) {
            return sendError(res, validation.error, 401, 'INVALID_TOKEN');
        }

        const sessionInfo = getSessionInfo(token);
        return sendSuccess(res, {
            user: validation.user,
            sessionCreated: sessionInfo.createdAt,
            sessionDuration: `${Math.floor(sessionInfo.duration / 1000)}s`,
        }, 'User information retrieved');
    } catch (err) {
        console.error('❌ Get user info error:', err.message);
        sendError(res, 'Failed to retrieve user info', 500, 'USER_INFO_ERROR');
    }
});

/**
 * @route   POST /auth/verify
 * @desc    Verify session token validity
 * @header  {string} Authorization - Bearer token
 * @returns {Object} Token validity status
 */
router.post('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return sendError(res, 'No token provided', 401, 'NO_TOKEN');
        }

        const validation = validateSessionToken(token);
        if (!validation.valid) {
            return sendError(res, validation.error, 401, 'INVALID_TOKEN');
        }

        return sendSuccess(res, {
            valid: true,
            user: validation.user,
        }, 'Token is valid');
    } catch (err) {
        console.error('❌ Token verification error:', err.message);
        sendError(res, 'Token verification failed', 500, 'VERIFY_ERROR');
    }
});

/**
 * @route   GET /auth/status
 * @desc    Get authentication system status
 * @returns {Object} System status and active sessions
 */
router.get('/status', (req, res) => {
    try {
        return sendSuccess(res, {
            status: 'operational',
            defaultAdminConfigured: true,
            activeSessions: getActiveSessions(),
            defaultCredentialsUsername: DEFAULT_CREDENTIALS.username,
            message: 'Change default credentials in production!',
        }, 'Auth system status retrieved');
    } catch (err) {
        console.error('❌ Status check error:', err.message);
        sendError(res, 'Failed to get status', 500, 'STATUS_ERROR');
    }
});

/**
 * Middleware: Verify authentication token
 */
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return sendError(res, 'Authentication required', 401, 'NO_TOKEN');
    }

    const validation = validateSessionToken(token);
    if (!validation.valid) {
        return sendError(res, validation.error, 401, 'INVALID_TOKEN');
    }

    // Attach user to request object
    req.user = validation.user;
    next();
}

module.exports = router;
module.exports.requireAuth = requireAuth;
