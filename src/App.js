/**
 * App.js
 *
 * Головний компонент додатку FocusFlow.
 * Відповідає за:
 * 1. Маршрутизацію сторінок за допомогою React Router.
 * 2. Підключення компонентів сторінок та їх відображення у Layout (DashboardLayout).
 * 3. Обробку некоректних URL через редірект на головну сторінку.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Імпорт сторінок додатку
import StartPage from "./pages/StartPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import WeeklyToDoPage from "./pages/WeeklyToDoPage";
import HabitTrackerPage from "./pages/HabitTrackerPage";
import MonthlyBudgetPage from "./pages/MonthlyBudgetPage";
import ProjectPlannerPage from "./pages/ProjectPlannerPage";

// Імпорт Layout для Dashboard
import DashboardLayout from "./layout/DashboardLayout";

/**
 * Головний компонент додатку FocusFlow.
 * Відповідає за:
 * 1. Маршрутизацію сторінок за допомогою React Router.
 * 2. Підключення компонентів сторінок та їх відображення у Layout (DashboardLayout).
 * 3. Обробку некоректних URL через редірект на головну сторінку.
 * @component
 * @returns {JSX.Element} Повноцінний застосунок з налаштованою маршрутизацією.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Головні сторінки */}
        <Route path="/" element={<StartPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Сторінки Dashboard обгорнуті в DashboardLayout */}
        <Route
          path="/weekly"
          element={
            <DashboardLayout>
              <WeeklyToDoPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/habits"
          element={
            <DashboardLayout>
              <HabitTrackerPage />
            </DashboardLayout>
          }
        />
        <Route 
          path="/budget" 
          element={
            <DashboardLayout>
              <MonthlyBudgetPage />
            </DashboardLayout>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <DashboardLayout>
              <ProjectPlannerPage />
            </DashboardLayout>
          } 
        />

        {/* Редірект на головну сторінку для некоректних URL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
