import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl mb-4 animate-pulse">
            <Zap size={22} className="text-white" />
          </div>
          <p className="text-slate-500 text-sm">Loading FinanceOS…</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return children
}
