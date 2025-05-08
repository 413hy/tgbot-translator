const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir = 'logs') {
    this.logDir = logDir;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    if (level === 'error') {
      console.error(`[${timestamp}] ERROR: ${message}`);
    } else {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  error(message, data = {}) {
    this.log('error', message, data);
  }
}

module.exports = new Logger();