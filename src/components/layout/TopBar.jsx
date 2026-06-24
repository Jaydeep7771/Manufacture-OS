import { /* Bell, */ } from 'lucide-react'
import { /* Link, */ useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const routeLabels = {
  '/': 'Dashboard',
  '/costs': 'Master Cost Sheet',
  '/templates': 'Product Templates',
  '/products': 'Products',
  '/alerts': 'Alerts',
  '/simulator': 'Scenario Simulator',
  '/compare': 'Product Comparison',
  '/analytics': 'Component Analytics',
  '/trends': 'Margin Trends',
  '/reports': 'Reports',
}

export default function TopBar() {
  const { /* unreadAlertCount, */ user } = useApp()
  const location = useLocation()
  const title = routeLabels[location.pathname] || 'FinanceOS'

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400 font-medium">{user?.company || 'FinanceOS'}</p>
      </div>

      {/* Search bar removed */}

      {/* Alerts bell — disabled
      <Link to="/alerts" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
        <Bell size={18} />
        {unreadAlertCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadAlertCount}
          </span>
        )}
      </Link>
      */}

      <div
        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer shadow-sm"
        title={user?.email}
      >
        {user?.avatar || 'U'}
      </div>
    </header>
  )
}
