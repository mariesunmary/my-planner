import React, { Component } from 'react';
import logger from '../utils/logger';
import ErrorFallback from './ErrorFallback';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our custom comprehensive logger to CRITICAL level
    const errorId = error.errorId || 'N/A';
    
    logger.critical('ErrorBoundary', `Uncaught UI Exception (ID: ${errorId})`, {
      originalError: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      customCode: error.code || 'UNKNOWN_UI_ERROR',
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.errorInfo} />;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
