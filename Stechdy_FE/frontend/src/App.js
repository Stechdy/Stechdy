import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PublicRoute from "./components/common/PublicRoute";
import PrivateRoute from "./components/common/PrivateRoute";
import AdminPrivateRoute from "./components/common/AdminPrivateRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import PremiumUpdateHandler from "./components/common/PremiumUpdateHandler";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";

// Landing Page
import LandingNew from "./pages/LandingNew/LandingNew";
import Pricing from "./pages/Pricing/Pricing";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// Admin Auth Pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminForgotPassword from "./pages/Admin/AdminForgotPassword";
import AdminPayments from "./pages/Admin/AdminPayments";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminRevenue from "./pages/Admin/AdminRevenue";
import AdminReports from "./pages/Admin/AdminReports";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminActivity from "./pages/Admin/AdminActivity";
import AdminDiscounts from "./pages/Admin/AdminDiscounts";

// Main App Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Calendar from "./pages/Calendar/Calendar";
import Mood from "./pages/Mood/Mood";
import Account from "./pages/Account/Account";
import About from "./pages/About/About";
import UserInformation from "./pages/UserInformation/UserInformation";
import SlotDetail from "./pages/SlotDetail/SlotDetail";
import MoodHistory from "./pages/Mood/MoodHistory";
import StudyTracker from "./pages/StudyTracker/StudyTracker";
import SubjectDetail from "./pages/SubjectDetail/SubjectDetail";
import Notifications from "./pages/Notifications/Notifications";
import NotificationSettings from "./pages/NotificationSettings/NotificationSettings";
import HelpSupport from "./pages/HelpSupport/HelpSupport";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse";
import AIGenerator from "./pages/AIGenerator/AIGenerator";
import ScheduleEditor from "./pages/ScheduleEditor/ScheduleEditor";
import CalendarEditor from "./pages/CalendarEditor/CalendarEditor";
import AIChat from "./pages/AIChat/AIChat";
import CelebrationTest from "./pages/Test/CelebrationTest";
import Onboarding from "./pages/Onboarding/Onboarding";

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <PremiumUpdateHandler>
          <Router>
            <ScrollToTop />
            <Routes>
            {/* Public Routes - Redirect if authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:resetToken"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Admin Public Routes */}
            <Route
              path="/admin/login"
              element={
                <PublicRoute redirectTo="/admin/dashboard">
                  <AdminLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/forgot-password"
              element={
                <PublicRoute redirectTo="/admin/dashboard">
                  <AdminForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminPrivateRoute>
                  <AdminPayments />
                </AdminPrivateRoute>
              }
            />

            {/* Private Routes - User Dashboard */}
            <Route
              path="/onboarding"
              element={
                <PrivateRoute>
                  <Onboarding />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar-editor"
              element={
                <PrivateRoute>
                  <CalendarEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/mood"
              element={
                <PrivateRoute>
                  <Mood />
                </PrivateRoute>
              }
            />
            <Route
              path="/mood/history"
              element={
                <PrivateRoute>
                  <MoodHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <PrivateRoute>
                  <AIChat />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-generator"
              element={
                <PrivateRoute>
                  <AIGenerator />
                </PrivateRoute>
              }
            />
            <Route
              path="/schedule-editor"
              element={
                <PrivateRoute>
                  <ScheduleEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              }
            />
            <Route
              path="/notification-settings"
              element={
                <PrivateRoute>
                  <NotificationSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/study-tracker"
              element={
                <PrivateRoute>
                  <StudyTracker />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              }
            />
            <Route
              path="/slot-detail/:id"
              element={
                <PrivateRoute>
                  <SlotDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/subject/:id"
              element={
                <PrivateRoute>
                  <SubjectDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserInformation />
                </PrivateRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/test/celebration" element={<CelebrationTest />} />
            {/* Legacy routes for authenticated users */}
            <Route
              path="/help"
              element={
                <PrivateRoute>
                  <HelpSupport />
                </PrivateRoute>
              }
            />
            <Route
              path="/terms"
              element={
                <PrivateRoute>
                  <TermsOfUse />
                </PrivateRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminPrivateRoute>
                  <AdminDashboard />
                </AdminPrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminPrivateRoute>
                  <AdminUsers />
                </AdminPrivateRoute>
              }
            />
            <Route
              path="/admin/revenue"
              element={
                <AdminPrivateRoute>
                  <AdminRevenue />
                </AdminPrivateRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminPrivateRoute>
                  <AdminReports />
                </AdminPrivateRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminPrivateRoute>
                  <AdminNotifications />
                </AdminPrivateRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <AdminPrivateRoute>
                  <AdminActivity />
                </AdminPrivateRoute>
              }
            />
            <Route
              path="/admin/discounts"
              element={
                <AdminPrivateRoute>
                  <AdminDiscounts />
                </AdminPrivateRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<LandingNew />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </PremiumUpdateHandler>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
