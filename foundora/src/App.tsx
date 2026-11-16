import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useStore } from './lib/store'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import StepDetail from './pages/StepDetail'
import Assistant from './pages/Assistant'
import Validate from './pages/Validate'
import Costs from './pages/Costs'
import Resources from './pages/Resources'
import Pricing from './pages/Pricing'

function NeedsProfile({ children }: { children: ReactNode }) {
  const { profile } = useStore()
  return profile ? children : <Navigate to="/start" replace />
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <Layout>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<Onboarding />} />
        <Route path="/dashboard" element={<NeedsProfile><Dashboard /></NeedsProfile>} />
        <Route path="/roadmap/:id" element={<NeedsProfile><StepDetail /></NeedsProfile>} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
