import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { PrivateRoute, PublicRoute, AdminRoute, StudentRoute } from '@/components/layout/RouteGuards'
import AppLayout from '@/components/layout/AppLayout'

// Auth pages
import { LoginPage, RegisterPage } from '@/pages/AuthPages'
import PendingPage from '@/pages/PendingPage'

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTests     from '@/pages/admin/Tests'
import AdminUsers     from '@/pages/admin/Users'
import AdminResults   from '@/pages/admin/Results'
import AdminAnalytics from '@/pages/admin/Analytics'

// Student pages
import StudentHome    from '@/pages/student/Home'
import TestPage       from '@/pages/student/TestPage'
import ResultPage     from '@/pages/student/ResultPage'
import StudentResults from '@/pages/student/Results'
import ProfilePage    from '@/pages/student/Profile'

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Public (redirect if logged in) ────────────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Pending approval ──────────────────────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route path="/pending" element={<PendingPage />} />
        </Route>

        {/* ── Admin routes ──────────────────────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/admin"            element={<AdminDashboard />} />
            <Route path="/admin/tests"      element={<AdminTests />} />
            <Route path="/admin/users"      element={<AdminUsers />} />
            <Route path="/admin/results"    element={<AdminResults />} />
            <Route path="/admin/analytics"  element={<AdminAnalytics />} />
            <Route path="/admin/profile"    element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── Student routes ────────────────────────────────────────────── */}
        <Route element={<StudentRoute />}>
          {/* Full-screen test pages (no sidebar) */}
          <Route path="/student/test/:id"    element={<TestPage />} />
          <Route path="/student/result/:id"  element={<ResultPage />} />

          {/* Sidebar layout */}
          <Route element={<AppLayout />}>
            <Route path="/student"         element={<StudentHome />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── Fallback ──────────────────────────────────────────────────── */}
        <Route path="/"   element={<Navigate to="/login" replace />} />
        <Route path="*"   element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
