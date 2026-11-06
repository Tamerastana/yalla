import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RequireAuth } from './components/layout/RequireAuth'
import { Home } from './pages/Home'
import { EventDetails } from './pages/EventDetails'
import { CreateEventPage } from './pages/CreateEvent'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'
import { ForgotPasswordPage } from './pages/ForgotPassword'
import { ResetPasswordPage } from './pages/ResetPassword'
import { ProfilePage } from './pages/Profile'
import { PointsHistoryPageRoute } from './pages/PointsHistoryPage'
import { RewardsPage } from './pages/Rewards'
import { CompanyStorePage } from './pages/CompanyStore'
import { CompanyDashboardPage } from './pages/CompanyDashboard'
import { AdminPanelPage } from './pages/AdminPanel'
import { NotFoundPage } from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="rewards/company/:companyId" element={<CompanyStorePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          path="create"
          element={
            <RequireAuth>
              <CreateEventPage />
            </RequireAuth>
          }
        />
        <Route
          path="events/:id/edit"
          element={
            <RequireAuth>
              <CreateEventPage />
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="points"
          element={
            <RequireAuth>
              <PointsHistoryPageRoute />
            </RequireAuth>
          }
        />
        <Route
          path="company"
          element={
            <RequireAuth roles={['company']}>
              <CompanyDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth roles={['super_admin']}>
              <AdminPanelPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
