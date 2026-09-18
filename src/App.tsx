import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RequireAuth } from './components/layout/RequireAuth'
import { Home } from './pages/Home'
import { EventDetails } from './pages/EventDetails'
import { CreateEventPage } from './pages/CreateEvent'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'
import { ProfilePage } from './pages/Profile'
import { RewardsPage } from './pages/Rewards'
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
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="create"
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
