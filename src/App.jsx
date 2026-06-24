import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

// Route-level code splitting — keeps recharts out of the initial bundle.
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const MasterCosts = lazy(() => import('./pages/costs/MasterCosts'))
const Templates = lazy(() => import('./pages/templates/Templates'))
const Products = lazy(() => import('./pages/products/Products'))
const Alerts = lazy(() => import('./pages/alerts/Alerts'))
const Simulator = lazy(() => import('./pages/simulator/Simulator'))
const Compare = lazy(() => import('./pages/compare/Compare'))
const Analytics = lazy(() => import('./pages/analytics/Analytics'))
const Trends = lazy(() => import('./pages/trends/Trends'))
const Reports = lazy(() => import('./pages/reports/Reports'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full py-20 text-slate-400 text-sm">
      Loading…
    </div>
  )
}

// Auth gate: must be signed in, then data is loaded for the user's company.
function ProtectedShell() {
  return (
    <ProtectedRoute>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated app */}
          <Route path="/" element={<ProtectedShell />}>
            <Route
              element={
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="costs" element={<MasterCosts />} />
              <Route path="templates" element={<Templates />} />
              <Route path="products" element={<Products />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="simulator" element={<Simulator />} />
              <Route path="compare" element={<Compare />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="trends" element={<Trends />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
