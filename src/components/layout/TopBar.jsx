import { Bell, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
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
  const { unreadAlertCount, user } = useApp()
  const location = useLocation()
  const title = routeLabels[location.pathname] || 'FinanceOS'

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-500">{user?.company || 'FinanceOS'}</p>
      </div>

      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search products, costs..."
          className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
      </div>

      <Link to="/alerts" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
        <Bell size={18} />
        {unreadAlertCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadAlertCount}
          </span>
        )}
      </Link>

      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer" title={user?.email}>
        {user?.avatar || 'U'}
      </div>
    </header>
  )
}
