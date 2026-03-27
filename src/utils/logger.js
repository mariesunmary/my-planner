const LOG_LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50,
};

const MAX_STORED_LOGS = 100;
const LOG_STORAGE_KEY = 'app_logs';

class Logger {
  constructor() {
    this.setLevel(
      localStorage.getItem('LOG_LEVEL') ||
      process.env.REACT_APP_LOG_LEVEL ||
      'INFO'
    );
  }

  setLevel(levelName) {
    if (LOG_LEVELS[levelName]) {
      this.currentLevel = LOG_LEVELS[levelName];
      this.currentLevelName = levelName;
    } else {
      this.currentLevel = LOG_LEVELS.INFO;
      this.currentLevelName = 'INFO';
    }
  }

  getLevel() {
    return this.currentLevelName;
  }

  _formatMessage(levelName, module, message) {
    const time = new Date().toISOString();
    return `[${time}] [${levelName}] [${module}] - ${message}`;
  }

  _persistLog(logEntry) {
    try {
      const logsStr = localStorage.getItem(LOG_STORAGE_KEY) || '[]';
      let logs = JSON.parse(logsStr);
      logs.push(logEntry);
      
      // Log rotation (by size/count)
      if (logs.length > MAX_STORED_LOGS) {
        logs = logs.slice(logs.length - MAX_STORED_LOGS);
      }
      
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      // LocalStorage might be full or disabled
      console.warn('Failed to persist log to localStorage', e);
    }
  }

  _log(levelName, module, message, context = {}) {
    if (LOG_LEVELS[levelName] < this.currentLevel) {return;}

    const formattedMessage = this._formatMessage(levelName, module, message);
    const logEntry = {
      time: new Date().toISOString(),
      level: levelName,
      module,
      message,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      }
    };

    // Console Handler
    switch (levelName) {
      case 'DEBUG':
        console.debug(formattedMessage, context);
        break;
      case 'INFO':
        console.info(formattedMessage, context);
        break;
      case 'WARNING':
        console.warn(formattedMessage, context);
        break;
      case 'ERROR':
      case 'CRITICAL':
        console.error(formattedMessage, context);
        break;
      default:
        console.log(formattedMessage, context);
    }

    // LocalStorage Handler (Rotation included)
    this._persistLog(logEntry);
  }

  debug(module, message, context) {
    this._log('DEBUG', module, message, context);
  }

  info(module, message, context) {
    this._log('INFO', module, message, context);
  }

  warn(module, message, context) {
    this._log('WARNING', module, message, context);
  }

  error(module, message, context) {
    this._log('ERROR', module, message, context);
  }

  critical(module, message, context) {
    this._log('CRITICAL', module, message, context);
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem(LOG_STORAGE_KEY);
  }
}

const logger = new Logger();
export default logger;
