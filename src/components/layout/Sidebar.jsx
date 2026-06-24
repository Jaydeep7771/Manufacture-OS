import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, DollarSign, Layers, Package, Bell, FlaskConical,
  BarChart3, TrendingUp, GitCompare, Zap, LogOut,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABELS = {
  owner: 'Owner',
  finance_manager: 'Finance Manager',
  purchase_manager: 'Purchase Manager',
  production_manager: 'Production Manager',
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { to: '/costs', label: 'Master Costs', icon: DollarSign },
      { to: '/templates', label: 'Product Templates', icon: Layers },
      { to: '/products', label: 'Products', icon: Package },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/alerts', label: 'Alerts', icon: Bell, badge: true },
      { to: '/simulator', label: 'Scenario Simulator', icon: FlaskConical },
      { to: '/compare', label: 'Product Compare', icon: GitCompare },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/analytics', label: 'Component Analytics', icon: BarChart3 },
      { to: '/trends', label: 'Margin Trends', icon: TrendingUp },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
]

export default function Sidebar() {
  const { unreadAlertCount, user } = useApp()
  const { signOut } = useAuth()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">FinanceOS</p>
            <p className="text-xs text-slate-400 mt-0.5">Profitability Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )
                  }
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {badge && unreadAlertCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadAlertCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.avatar || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{ROLE_LABELS[user?.role] || 'Owner'}</p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
