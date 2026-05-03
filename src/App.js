import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import StartPage from "./pages/StartPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import WeeklyToDoPage from "./pages/WeeklyToDoPage";
import HabitTrackerPage from "./pages/HabitTrackerPage";
import MonthlyBudgetPage from "./pages/MonthlyBudgetPage";
import ProjectPlannerPage from "./pages/ProjectPlannerPage";
import StatisticsPage from "./pages/StatisticsPage";
import DashboardLayout from "./layout/DashboardLayout";
import AccountPage from "./pages/AccountPage";

/**
 *
 * @param root0
 * @param root0.children
 */
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

/**
 *
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/weekly" element={<PrivateRoute><DashboardLayout><WeeklyToDoPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/habits" element={<PrivateRoute><DashboardLayout><HabitTrackerPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/budget" element={<PrivateRoute><DashboardLayout><MonthlyBudgetPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><DashboardLayout><ProjectPlannerPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/statistics" element={<PrivateRoute><DashboardLayout><StatisticsPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/account" element={<PrivateRoute><DashboardLayout><AccountPage /></DashboardLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

/**
 *
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
