import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/auth/RouteGuards'

// Layouts
import MainLayout   from './layouts/MainLayout'
import AdminLayout  from './layouts/AdminLayout'

// Public pages
import LandingPage  from './pages/LandingPage'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Authenticated pages
import DashboardPage    from './pages/DashboardPage'
import BrowsePage       from './pages/BrowsePage'
import ItemDetailPage   from './pages/ItemDetailPage'
import ReportLostPage   from './pages/ReportLostPage'
import ReportFoundPage  from './pages/ReportFoundPage'
import MyReportsPage    from './pages/MyReportsPage'
import MyClaimsPage     from './pages/MyClaimsPage'
import ProfilePage      from './pages/ProfilePage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminReportsPage   from './pages/admin/AdminReportsPage'
import AdminClaimsPage    from './pages/admin/AdminClaimsPage'
import AdminUsersPage     from './pages/admin/AdminUsersPage'

// 404
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

              {/* Authenticated routes */}
              <Route path="dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="browse"        element={<BrowsePage />} />
              <Route path="items/:id"     element={<ItemDetailPage />} />
              <Route path="report-lost"   element={<ProtectedRoute><ReportLostPage /></ProtectedRoute>} />
              <Route path="report-found"  element={<ProtectedRoute><ReportFoundPage /></ProtectedRoute>} />
              <Route path="my-reports"    element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
              <Route path="my-claims"     element={<ProtectedRoute><MyClaimsPage /></ProtectedRoute>} />
              <Route path="profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index        element={<AdminDashboardPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="claims"  element={<AdminClaimsPage />} />
              <Route path="users"   element={<AdminUsersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
