// Generate a basic unique ID for errors
const generateErrorId = () => Math.random().toString(36).substring(2, 9).toUpperCase();

export class AppError extends Error {
  constructor(message, code = 'GENERIC_ERROR', context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.errorId = generateErrorId();
    this.context = context;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NetworkError extends AppError {
  constructor(message, status = 0, context = {}) {
    super(message, 'NETWORK_ERROR', { ...context, status });
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}, context = {}) {
    super(message, 'VALIDATION_ERROR', { ...context, fields });
  }
}

export class AuthError extends AppError {
  constructor(message, context = {}) {
    super(message, 'AUTH_ERROR', context);
  }
}
