import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';

// ── Pages: Login ────────────────────────────────────────────────────────────
import LoginPage        from './pages/Login/LoginPage';
import SignupPage       from './pages/Login/SignupPage';
import ForgotPassword   from './pages/Login/ForgotPasswordPage';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';

// ── Pages: Admin ────────────────────────────────────────────────────────────
import AdminDashboard   from './pages/Admin/DashboardPage';
import AdminMembers     from './pages/Admin/MembersPage';
import AdminStaff       from './pages/Admin/StaffPage';
import AdminTrainer     from './pages/Admin/TrainerPage';
import AdminEquipment   from './pages/Admin/EquipmentPage';
import AdminBlog        from './pages/Admin/BlogPage';
import AdminNotif       from './pages/Admin/NotificationPage';
import AdminReports     from './pages/Admin/ReportsPage';

// ── Pages: PT ───────────────────────────────────────────────────────────────
import PTDashboard      from './pages/PT/PTDashboardPage';
import PTSchedule       from './pages/PT/SchedulePage';
import PTStudents       from './pages/PT/StudentsPage';
import PTWorkouts       from './pages/PT/WorkoutsPage';
import PTReviews        from './pages/PT/ReviewsPage';

// ── Pages: Member ───────────────────────────────────────────────────────────
import MemberHome       from './pages/Member/HomePage';
import MemberProfile    from './pages/Member/ProfilePage';
import MemberPayment    from './pages/Member/PaymentPage';
import BlogDetail       from './pages/Member/BlogDetailPage';
import Notifications    from './pages/Member/NotificationsPage';

// ── Pages: Public ───────────────────────────────────────────────────────────
import ExercisePage     from './pages/Public/ExercisePage';
import RateTrainers     from './pages/Public/RateTrainersPage';

import LandingPage      from './pages/Public/LandingPage';

import PublicBlogList   from './pages/Public/BlogListPage';
import PublicBlogDetail from './pages/Public/BlogDetailPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Root → Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<PublicBlogList />} />
      <Route path="/blog/:id" element={<PublicBlogDetail />} />

      {/* ── Public ────────────────────────────────────────────────── */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/exercise/:type"  element={<ExercisePage />} />
      <Route path="/rate-trainers"   element={<RateTrainers />} />

      {/* ── Admin ─────────────────────────────────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/members" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <AdminMembers />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminStaff />
        </ProtectedRoute>
      } />
      <Route path="/admin/trainer" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminTrainer />
        </ProtectedRoute>
      } />
      <Route path="/admin/equipment" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminEquipment />
        </ProtectedRoute>
      } />
      <Route path="/admin/blog" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <AdminBlog />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <AdminNotif />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <AdminReports />
        </ProtectedRoute>
      } />

      {/* ── PT ────────────────────────────────────────────────────── */}
      <Route path="/pt" element={
        <ProtectedRoute allowedRoles={['pt']}>
          <PTDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pt/schedule" element={
        <ProtectedRoute allowedRoles={['pt']}>
          <PTSchedule />
        </ProtectedRoute>
      } />
      <Route path="/pt/students" element={
        <ProtectedRoute allowedRoles={['pt']}>
          <PTStudents />
        </ProtectedRoute>
      } />
      <Route path="/pt/workouts" element={
        <ProtectedRoute allowedRoles={['pt']}>
          <PTWorkouts />
        </ProtectedRoute>
      } />
      <Route path="/pt/reviews" element={
        <ProtectedRoute allowedRoles={['pt']}>
          <PTReviews />
        </ProtectedRoute>
      } />

      {/* ── Member ────────────────────────────────────────────────── */}
      <Route path="/member" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberHome />
        </ProtectedRoute>
      } />
      <Route path="/member/profile" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberProfile />
        </ProtectedRoute>
      } />
      <Route path="/member/payment" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberPayment />
        </ProtectedRoute>
      } />
      <Route path="/member/blog/:id" element={
        <ProtectedRoute allowedRoles={['member']}>
          <BlogDetail />
        </ProtectedRoute>
      } />
      <Route path="/member/notifications" element={
        <ProtectedRoute allowedRoles={['member']}>
          <Notifications />
        </ProtectedRoute>
      } />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
