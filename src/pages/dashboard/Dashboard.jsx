import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, TrendingDown, /* AlertTriangle, */ DollarSign,
  ArrowRight, Target, Flame,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { calculateProductCost, formatCurrency } from '../../utils/calculations'
import { marginTrendData } from '../../data/staticData'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function Dashboard() {
  const { products, templates, costs, /* alerts */ } = useApp()

  const productMetrics = useMemo(() => {
    return products.map((p) => {
      const calc = calculateProductCost(p, templates, costs)
      return { ...p, ...calc }
    }).sort((a, b) => b.margin - a.margin)
  }, [products, templates, costs])

  const avgMargin = (productMetrics.reduce((s, p) => s + p.margin, 0) / productMetrics.length).toFixed(1)
  const topProduct = productMetrics[0]
  const bottomProduct = productMetrics[productMetrics.length - 1]

  const brassRate = costs.find((c) => c.category === 'raw_material' && c.name.toLowerCase().includes('brass') && !c.name.toLowerCase().includes('scrap'))?.cost || 0
  // const unreadAlerts = alerts.filter((a) => !a.isRead)

  return (
    <div className="space-y-6">
      {/* Alert Banner — commented out (Alerts module disabled)
      {unreadAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <span className="font-semibold">{unreadAlerts.length} new alerts:</span>{' '}
            {unreadAlerts[0].title}
          </p>
          <Link to="/alerts" className="text-amber-700 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
      )}
      */}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          subtitle="Active in portfolio"
          icon={Package}
          iconColor="blue"
          trend={12}
          trendLabel="this quarter"
        />
        <StatCard
          title="Average Margin"
          value={`${avgMargin}%`}
          subtitle="Across all products"
          icon={Target}
          iconColor={avgMargin >= 25 ? 'emerald' : avgMargin >= 15 ? 'amber' : 'red'}
          trend={-1.7}
          trendLabel="this month"
        />
        <StatCard
          title="Current Brass Rate"
          value={formatCurrency(brassRate) + '/kg'}
          subtitle="↑ 7.7% from last month"
          icon={DollarSign}
          iconColor="amber"
          trend={7.7}
          trendLabel="vs last month"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Average Margin Trend" subtitle="Last 6 months" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={marginTrendData}>
              <defs>
                <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[20, 40]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'Avg Margin']} />
              <Area type="monotone" dataKey="avgMargin" stroke="#3b82f6" strokeWidth={2} fill="url(#marginGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Product Margin Distribution" subtitle="Current margins by product" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productMetrics.slice(0, 6)} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="sku" type="category" width={72} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, 'Margin']} />
              <Bar dataKey="margin" fill="#3b82f6" radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 11, formatter: (v) => `${v.toFixed(0)}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Products Table + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Profitability Table */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Product Profitability</h3>
                <p className="text-sm text-slate-500 mt-0.5">All products ranked by margin</p>
              </div>
              <Link to="/products" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="text-right px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cost</th>
                    <th className="text-right px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                    <th className="text-right px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Margin</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productMetrics.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{p.sku} · {p.templateName}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600 font-medium tabular-nums">{formatCurrency(p.totalCost)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600 font-medium tabular-nums">{formatCurrency(p.sellingPrice)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge variant={p.margin >= 30 ? 'success' : p.margin >= 20 ? 'info' : p.margin >= 10 ? 'warning' : 'danger'}>
                          {p.margin.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-800 tabular-nums">{formatCurrency(p.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          {/* Highlights */}
          <Card>
            <CardHeader title="Highlights" />
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                <Flame size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700">Top Performer</p>
                  <p className="text-sm font-medium text-slate-800">{topProduct?.name}</p>
                  <p className="text-xs text-emerald-600">{topProduct?.margin.toFixed(1)}% margin</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <TrendingDown size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-600">Needs Attention</p>
                  <p className="text-sm font-medium text-slate-800">{bottomProduct?.name}</p>
                  <p className="text-xs text-red-500">{bottomProduct?.margin.toFixed(1)}% margin</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Alerts — disabled
          <Card>
            <CardHeader
              title="Recent Alerts"
              action={
                <Link to="/alerts" className="text-blue-600 text-xs font-medium hover:underline">View all</Link>
              }
            />
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                  <div>
                    <p className="text-xs font-medium text-slate-700 leading-snug">{alert.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          */}
        </div>
      </div>
    </div>
  )
}
