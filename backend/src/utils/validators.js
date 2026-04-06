// src/utils/validators.js
// ─────────────────────────────────────────────────────────────────────────────
// Input Validation & Sanitization Utilities
// Provides reusable validators for common data types and patterns.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate integer within range
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateInteger(value, min = 0, max = Infinity) {
    const num = parseInt(value);
    if (isNaN(num)) return { valid: false, error: 'Must be an integer' };
    if (num < min) return { valid: false, error: `Must be >= ${min}` };
    if (num > max) return { valid: false, error: `Must be <= ${max}` };
    return { valid: true };
}

/**
 * Validate string length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateString(value, minLength = 0, maxLength = 255) {
    if (typeof value !== 'string') return { valid: false, error: 'Must be a string' };
    if (value.length < minLength) return { valid: false, error: `Min length is ${minLength}` };
    if (value.length > maxLength) return { valid: false, error: `Max length is ${maxLength}` };
    return { valid: true };
}

/**
 * Validate coin ID (alphanumeric + hyphen only)
 * @param {string} coinId - Coin identifier
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateCoinId(coinId) {
    if (!coinId || typeof coinId !== 'string') {
        return { valid: false, error: 'Coin ID is required' };
    }
    if (!/^[a-z0-9\-]{1,50}$/.test(coinId)) {
        return { valid: false, error: 'Invalid coin ID format' };
    }
    return { valid: true };
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
}

/**
 * Validate ISO datetime string
 * @param {string} dateStr - Date string to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateDate(dateStr) {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }
        return { valid: true };
    } catch (err) {
        return { valid: false, error: 'Invalid date' };
    }
}

/**
 * Sanitize string input (remove dangerous characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/[<>\"']/g, '') // Remove dangerous HTML chars
        .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize coin filter
 * @param {string} coinFilter - Coin ID filter
 * @returns {Object} { valid: boolean, value?: string, error?: string }
 */
function validateCoinFilter(coinFilter) {
    if (!coinFilter) return { valid: true }; // Optional
    
    const validation = validateCoinId(coinFilter);
    if (!validation.valid) return validation;
    
    return { valid: true, value: coinFilter };
}

/**
 * Validate pagination parameters
 * @param {string|number} limit - Limit per page
 * @param {string|number} offset - Offset
 * @returns {Object} { valid: boolean, limit?: number, offset?: number, error?: string }
 */
function validatePagination(limit = '50', offset = '0') {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum)) return { valid: false, error: 'Invalid limit' };
    if (isNaN(offsetNum)) return { valid: false, error: 'Invalid offset' };
    if (limitNum < 1) return { valid: false, error: 'Limit must be >= 1' };
    if (limitNum > 500) return { valid: false, error: 'Limit must be <= 500' };
    if (offsetNum < 0) return { valid: false, error: 'Offset must be >= 0' };

    return { 
        valid: true, 
        limit: Math.min(limitNum, 500), 
        offset: offsetNum 
    };
}

/**
 * Validate CSV row count for generation
 * @param {string|number} rows - Number of rows
 * @returns {Object} { valid: boolean, rows?: number, error?: string }
 */
function validateCSVRowCount(rows = '100') {
    const rowNum = parseInt(rows);
    if (isNaN(rowNum)) return { valid: false, error: 'Rows must be an integer' };
    if (rowNum < 1) return { valid: false, error: 'Rows must be >= 1' };
    if (rowNum > 5000) return { valid: false, error: 'Max 5000 rows allowed' };
    
    return { valid: true, rows: rowNum };
}

/**
 * Log validation error for debugging
 * @param {string} field - Field name
 * @param {string} error - Error message
 * @param {Object} input - Input data
 */
function logValidationError(field, error, input) {
    console.warn(`⚠️  Validation failed for '${field}': ${error}`);
    console.debug(`   Input: ${JSON.stringify(input)}`);
}

module.exports = {
    validateInteger,
    validateString,
    validateCoinId,
    validateEmail,
    validateDate,
    sanitizeString,
    validateCoinFilter,
    validatePagination,
    validateCSVRowCount,
    logValidationError,
};
