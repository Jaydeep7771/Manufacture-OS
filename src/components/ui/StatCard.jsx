import { clsx } from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, subtitle, trend, trendLabel, icon: Icon, iconColor = 'blue', className }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-50 text-slate-600',
  }

  const trendPositive = trend > 0

  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && (
          <div className={clsx('p-2 rounded-lg', colorMap[iconColor])}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {trend !== undefined && (
        <div className={clsx('flex items-center gap-1 text-xs font-medium', trendPositive ? 'text-emerald-600' : 'text-red-600')}>
          {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trendPositive ? '+' : ''}{trend}% {trendLabel}</span>
        </div>
      )}
    </div>
  )
}
