// src/utils/response.js
// ─────────────────────────────────────────────────────────────────────────────
// Standardized Response Builder
// Ensures consistent API responses across all endpoints with proper status
// codes, metadata, and error handling.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} metadata - Optional metadata (pagination, source, etc)
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200, metadata = {}) {
    return res.status(statusCode).json({
        success: true,
        status: 'success',
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        data,
        ...metadata,
    });
}

/**
 * Build an error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} code - Error code for client handling
 */
function sendError(res, error, statusCode = 500, code = 'INTERNAL_ERROR') {
    return res.status(statusCode).json({
        success: false,
        status: 'error',
        statusCode,
        code,
        message: error,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Build a validation error response
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Validation errors
 */
function sendValidationError(res, errors) {
    const errorList = Array.isArray(errors) ? errors : [errors];
    return res.status(400).json({
        success: false,
        status: 'validation_error',
        statusCode: 400,
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        timestamp: new Date().toISOString(),
        errors: errorList,
    });
}

/**
 * Send a response with pagination metadata
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {number} total - Total count of records
 * @param {number} limit - Limit used in query
 * @param {number} offset - Offset used in query
 */
function sendPaginated(res, data, total, limit, offset, message = 'Success') {
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    return sendSuccess(res, data, message, 200, {
        pagination: {
            total,
            page,
            limit,
            offset,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    });
}

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendPaginated,
};
