const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, 'error.log');

const logger = {
  logError: (err, req = null) => {
    const timestamp = new Date().toISOString();
    let logMessage = `\n[${timestamp}] ❌ ERROR:\n`;
    
    if (req) {
      logMessage += `📍 Route: ${req.method} ${req.originalUrl}\n`;
      if (Object.keys(req.body).length) {
        logMessage += `📦 Body: ${JSON.stringify(req.body)}\n`;
      }
    }
    
    logMessage += `⚠️ Message: ${err.message || err}\n`;
    if (err.stack) {
      logMessage += `🛠️ Stack Trace:\n${err.stack}\n`;
    }
    logMessage += '-'.repeat(60);

    // Append to the developer log file
    fs.appendFile(logFile, logMessage, (writeErr) => {
      if (writeErr) console.error('Failed to write to error log:', writeErr);
    });

    // Output to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${err.message}`);
    }
  },

  // Standardizes the response sent to the user based on the environment
  sendErrorResponse: (res, err, status = 500) => {
    const isProd = process.env.NODE_ENV === 'production';
    
    res.status(status).json({
      success: false,
      error: isProd ? 'An unexpected internal server error occurred. Our team has been notified.' : (err.message || 'Error occurred'),
      ...( !isProd && { stack: err.stack } ) // Only leak the stack trace to the browser in development
    });
  }
};

module.exports = logger;