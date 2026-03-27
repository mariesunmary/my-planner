/**
 * index.js
 * 
 * Стартова точка React-додатку.
 * Цей файл відповідає за ініціалізацію React і підключення головного компонента App.
 * Також підключає глобальні стилі з index.css.
 */

import React from 'react';                       
import ReactDOM from 'react-dom/client';        
import App from './App';                        
import './index.css';                            
import ErrorBoundary from './components/ErrorBoundary';
import logger from './utils/logger';

// Log Application Startup
logger.info('System', 'Application is starting up...', {
  environment: process.env.NODE_ENV,
});

window.addEventListener('beforeunload', () => {
  logger.info('System', 'Application is shutting down (tab closed or refreshed).');
});

// Створення root-елемента для React у HTML-документі
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендеринг головного компонента App всередині root
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
