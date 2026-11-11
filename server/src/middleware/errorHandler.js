// Central error handling middleware conforming to PRD specs
function errorHandler(err, req, res, next) {
  // Log server-side for diagnostics
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'An unexpected error occurred. Please try again.';

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message
  });
}

// 404 Not Found handler
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

