import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useApp } from '../../context/AppContext'
import { calculateProductCost, formatCurrency } from '../../utils/calculations'
import Card, { CardHeader } from '../../components/ui/Card'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Analytics() {
  const { products, templates, costs } = useApp()

  const allMetrics = useMemo(() => products.map((p) => ({ ...p, ...calculateProductCost(p, templates, costs) })), [products, templates, costs])

  const componentTotals = useMemo(() => {
    const totals = {}
    allMetrics.forEach((p) => {
      p.componentCosts?.forEach((c) => {
        if (!totals[c.name]) totals[c.name] = { name: c.name, total: 0, count: 0 }
        totals[c.name].total += c.total
        totals[c.name].count += 1
      })
      const bName = 'Brass (Raw Material)'
      if (!totals[bName]) totals[bName] = { name: bName, total: 0, count: 0 }
      totals[bName].total += p.rawMaterialCost || 0
      totals[bName].count += 1
    })
    const grand = Object.values(totals).reduce((s, v) => s + v.total, 0)
    return Object.values(totals)
      .map((t) => ({ ...t, pct: parseFloat(((t.total / grand) * 100).toFixed(1)) }))
      .sort((a, b) => b.total - a.total)
  }, [allMetrics])

  const categoryMargins = useMemo(() => {
    const byCategory = {}
    allMetrics.forEach((p) => {
      if (!byCategory[p.category]) byCategory[p.category] = []
      byCategory[p.category].push(p.margin)
    })
    return Object.entries(byCategory).map(([cat, margins]) => ({
      category: cat,
      avgMargin: parseFloat((margins.reduce((s, m) => s + m, 0) / margins.length).toFixed(1)),
      count: margins.length,
    }))
  }, [allMetrics])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Component Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">Understanding cost drivers across your product portfolio</p>
      </div>

      {/* Top Cost Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Cost Contribution by Component" subtitle="Total spend across all products" />
          <div className="space-y-3">
            {componentTotals.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className="text-slate-500">{c.pct}% · {formatCurrency(c.total)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Component Share (Pie)" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={componentTotals.slice(0, 6)} dataKey="total" nameKey="name" cx="45%" cy="50%" outerRadius={100}
                label={({ pct }) => `${pct}%`} labelLine={false}>
                {componentTotals.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Total Cost']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Margin Analysis */}
      <Card>
        <CardHeader title="Average Margin by Product Category" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={categoryMargins} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`${v}%`, 'Avg Margin']} />
            <Bar dataKey="avgMargin" fill="#3b82f6" radius={[6, 6, 0, 0]}
              label={{ position: 'top', fontSize: 12, formatter: (v) => `${v}%` }} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Component Breakdown Table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Detailed Component Cost Analysis</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Component</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Products Used In</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total Cost</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {componentTotals.map((c, i) => (
              <tr key={c.name} className="hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-medium text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-slate-600">{c.count}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-slate-800">{formatCurrency(c.total)}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-slate-700 font-medium w-10 text-right">{c.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
