import { clsx } from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    accent: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', accent: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   accent: 'bg-amber-500' },
  red:     { bg: 'bg-red-50',     icon: 'text-red-600',     accent: 'bg-red-500' },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  accent: 'bg-purple-500' },
  slate:   { bg: 'bg-slate-100',  icon: 'text-slate-600',   accent: 'bg-slate-500' },
}

export default function StatCard({ title, value, subtitle, trend, trendLabel, icon: Icon, iconColor = 'blue', className }) {
  const colors = colorMap[iconColor] || colorMap.blue
  const trendPositive = trend > 0

  return (
    <div className={clsx(
      'relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col gap-4 p-5',
      className
    )}>
      {/* Top accent line */}
      <div className={clsx('absolute top-0 left-0 right-0 h-0.5', colors.accent)} />

      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={clsx('p-2.5 rounded-xl', colors.bg)}>
            <Icon size={15} className={colors.icon} />
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
      </div>

      {trend !== undefined && (
        <div className={clsx(
          'flex items-center gap-1.5 text-xs font-semibold',
          trendPositive ? 'text-emerald-600' : 'text-red-500'
        )}>
          {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trendPositive ? '+' : ''}{trend}% {trendLabel}</span>
        </div>
      )}
    </div>
  )
}
