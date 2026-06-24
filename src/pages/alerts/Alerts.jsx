import { useState } from 'react'
import { AlertTriangle, TrendingUp, Bell, CheckCircle, Tag } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const typeConfig = {
  margin_drop: { label: 'Margin Drop', icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50' },
  cost_increase: { label: 'Cost Increase', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  price_revision: { label: 'Price Revision', icon: Tag, color: 'text-blue-500', bg: 'bg-blue-50' },
}

const severityVariant = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
}

export default function Alerts() {
  const { alerts, markAlertRead } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = alerts.filter((a) => {
    if (filter === 'unread') return !a.isRead
    if (filter === 'critical') return a.severity === 'critical'
    if (filter === 'warning') return a.severity === 'warning'
    return true
  })

  const unread = alerts.filter((a) => !a.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Alert Center</h2>
          <p className="text-sm text-slate-500 mt-0.5">{unread} unread · {alerts.length} total alerts</p>
        </div>
        <Button variant="secondary" onClick={() => alerts.forEach((a) => markAlertRead(a.id))}>
          <CheckCircle size={15} /> Mark all read
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4 border-red-100 bg-red-50">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Critical</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{alerts.filter((a) => a.severity === 'critical').length}</p>
          <p className="text-xs text-red-500 mt-0.5">Require immediate action</p>
        </Card>
        <Card className="!p-4 border-amber-100 bg-amber-50">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Warnings</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{alerts.filter((a) => a.severity === 'warning').length}</p>
          <p className="text-xs text-amber-500 mt-0.5">Monitor closely</p>
        </Card>
        <Card className="!p-4 border-blue-100 bg-blue-50">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Info</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{alerts.filter((a) => a.severity === 'info').length}</p>
          <p className="text-xs text-blue-500 mt-0.5">For your awareness</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[['all', 'All'], ['unread', 'Unread'], ['critical', 'Critical'], ['warning', 'Warning']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              filter === val ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
            {val === 'unread' && unread > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{unread}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const cfg = typeConfig[alert.type] || typeConfig.price_revision
          const Icon = cfg.icon

          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 flex items-start gap-4 transition-all ${
                !alert.isRead ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={severityVariant[alert.severity]}>{alert.severity}</Badge>
                      <span className="text-xs text-slate-400">{cfg.label}</span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{alert.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">{alert.createdAt}</p>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAlertRead(alert.id)}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Bell size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No alerts in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
