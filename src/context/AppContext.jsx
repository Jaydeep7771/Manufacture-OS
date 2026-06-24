import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Zap } from 'lucide-react'
import { useAuth } from './AuthContext'
import * as db from '../lib/db'

const AppContext = createContext(null)

const initials = (name) =>
  (name || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function AppProvider({ children }) {
  const { session, profile } = useAuth()
  const companyId = profile?.company_id

  const [costs, setCosts] = useState([])
  const [templates, setTemplates] = useState([])
  const [products, setProducts] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyData = useCallback((data) => {
    setCosts(data.costs)
    setTemplates(data.templates)
    setProducts(data.products)
    setAlerts(data.alerts)
  }, [])

  // Silent refetch used after a mutation — updates data without flashing the
  // full-screen loader.
  const refresh = useCallback(async () => {
    if (!companyId) return
    applyData(await db.fetchAll())
  }, [companyId, applyData])

  // Initial load (and reload if the active company changes).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!companyId) { setLoading(false); return }
      setLoading(true)
      try {
        const data = await db.fetchAll()
        if (!cancelled) { applyData(data); setError(null) }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [companyId, applyData])

  const user = useMemo(
    () => ({
      name: profile?.full_name || 'User',
      email: session?.user?.email || '',
      company: profile?.companies?.name || '',
      role: profile?.role || 'owner',
      avatar: initials(profile?.full_name),
    }),
    [profile, session]
  )

  // Each mutation writes to Supabase, then refetches the affected collections.
  const updateCost = useCallback(async (id, newCost) => { await db.updateCost(id, newCost); await refresh() }, [refresh])
  const addCost = useCallback(async (d) => { await db.addCost(companyId, d); await refresh() }, [companyId, refresh])
  const deleteCost = useCallback(async (id) => { await db.deleteCost(id); await refresh() }, [refresh])
  const addTemplate = useCallback(async (d) => { await db.addTemplate(companyId, d); await refresh() }, [companyId, refresh])
  const updateTemplate = useCallback(async (id, d) => { await db.updateTemplate(id, d); await refresh() }, [refresh])
  const addProduct = useCallback(async (d) => { await db.addProduct(companyId, d); await refresh() }, [companyId, refresh])
  const updateProduct = useCallback(async (id, d) => { await db.updateProduct(id, d); await refresh() }, [refresh])
  const deleteProduct = useCallback(async (id) => { await db.deleteProduct(id); await refresh() }, [refresh])
  const markAlertRead = useCallback(async (id) => { await db.markAlertRead(id); await refresh() }, [refresh])

  const unreadAlertCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts])

  const value = useMemo(
    () => ({
      user,
      costs,
      templates,
      products,
      alerts,
      unreadAlertCount,
      loading,
      error,
      refresh,
      updateCost,
      addCost,
      deleteCost,
      addTemplate,
      updateTemplate,
      addProduct,
      updateProduct,
      deleteProduct,
      markAlertRead,
    }),
    [
      user, costs, templates, products, alerts, unreadAlertCount, loading, error, refresh,
      updateCost, addCost, deleteCost, addTemplate, updateTemplate,
      addProduct, updateProduct, deleteProduct, markAlertRead,
    ]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl mb-4 animate-pulse">
            <Zap size={22} className="text-white" />
          </div>
          <p className="text-slate-500 text-sm">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Couldn't load your data</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); refresh() }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
