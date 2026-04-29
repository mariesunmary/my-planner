/**
 * index.js
 * 
 * Стартова точка React-додатку.
 * Цей файл відповідає за ініціалізацію React і підключення головного компонента App.
 * Також підключає глобальні стилі з index.css.
 */

import React from 'react';                       // Імпорт бібліотеки React для роботи з JSX
import ReactDOM from 'react-dom/client';        // Імпорт ReactDOM для рендерингу додатку в DOM
import App from './App';                        // Імпорт головного компонента додатку
import './index.css';                            // Підключення глобальних стилів

// Створення root-елемента для React у HTML-документі
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендеринг головного компонента App всередині root
root.render(<App />);
