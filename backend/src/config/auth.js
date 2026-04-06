// src/config/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication Configuration
// Default credentials & session management
// ─────────────────────────────────────────────────────────────────────────────

// DEFAULT CREDENTIALS - CHANGE THESE IN PRODUCTION!
const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@cryptoupdate.io',
    role: 'administrator',
    fullName: 'System Administrator',
};

// Session storage (in production, use Redis or database)
const activeSessions = new Map();

/**
 * Validate login credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} { valid: boolean, user?: Object, error?: string }
 */
function validateCredentials(username, password) {
    if (!username || !password) {
        return { valid: false, error: 'Username and password required' };
    }

    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
        // Clone user object without password
        const user = { ...DEFAULT_CREDENTIALS };
        delete user.password;
        return { valid: true, user };
    }

    return { valid: false, error: 'Invalid credentials' };
}

/**
 * Generate session token
 * @param {Object} user - User object
 * @returns {string} Session token
 */
function generateSessionToken(user) {
    const token = Buffer.from(JSON.stringify({
        user,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7),
    })).toString('base64');

    activeSessions.set(token, {
        user,
        createdAt: new Date(),
        lastAccess: new Date(),
    });

    return token;
}

/**
 * Validate session token
 * @param {string} token - Session token
 * @returns {Object} { valid: boolean, user?: Object, error?: string }
 */
function validateSessionToken(token) {
    if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Invalid token format' };
    }

    const session = activeSessions.get(token);
    if (!session) {
        return { valid: false, error: 'Session expired or invalid' };
    }

    // Update last access time
    session.lastAccess = new Date();

    return { valid: true, user: session.user };
}

/**
 * Invalidate session (logout)
 * @param {string} token - Session token
 */
function invalidateSession(token) {
    activeSessions.delete(token);
}

/**
 * Get session info
 */
function getSessionInfo(token) {
    const session = activeSessions.get(token);
    if (!session) return null;

    return {
        user: session.user,
        createdAt: session.createdAt,
        lastAccess: session.lastAccess,
        duration: new Date() - session.createdAt,
    };
}

/**
 * Get all active sessions count
 */
function getActiveSessions() {
    return activeSessions.size;
}

module.exports = {
    DEFAULT_CREDENTIALS,
    validateCredentials,
    generateSessionToken,
    validateSessionToken,
    invalidateSession,
    getSessionInfo,
    getActiveSessions,
};
