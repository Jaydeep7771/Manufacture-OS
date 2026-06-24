import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, DollarSign, Layers, Package, /* Bell, */ FlaskConical,
  BarChart3, TrendingUp, GitCompare, Zap, LogOut, ChevronLeft, ChevronRight,
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
      // { to: '/alerts', label: 'Alerts', icon: Bell, badge: true }, // Alerts module disabled
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

export default function Sidebar({ collapsed, onToggle }) {
  const { /* unreadAlertCount, */ user } = useApp()
  const { signOut } = useAuth()

  return (
    <aside
      className={clsx(
        'bg-slate-900 text-white flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={clsx('border-b border-slate-800 flex items-center', collapsed ? 'px-0 py-5 justify-center' : 'px-5 py-5 justify-between')}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/30">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-none tracking-tight">FinanceOS</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Profitability Intelligence</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon /*, badge */ }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                      collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{label}</span>}
                  {/* Alert badge disabled
                  {badge && unreadAlertCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadAlertCount}
                    </span>
                  )}
                  */}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={onToggle}
            className="w-full flex justify-center p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* User */}
      <div className={clsx('border-t border-slate-800', collapsed ? 'px-2 py-3' : 'px-4 py-4')}>
        {collapsed ? (
          <div className="flex justify-center">
            <button
              onClick={signOut}
              title={`${user?.name || 'User'} — Sign out`}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold shadow"
            >
              {user?.avatar || 'U'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold shadow shrink-0">
              {user?.avatar || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{ROLE_LABELS[user?.role] || 'Owner'}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
