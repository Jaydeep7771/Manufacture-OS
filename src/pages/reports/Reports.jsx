import { useMemo } from 'react'
import { FileText, BarChart2, TrendingDown, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useApp } from '../../context/AppContext'
import { calculateProductCost, formatCurrency } from '../../utils/calculations'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Reports() {
  const { products, templates, costs } = useApp()

  const productMetrics = useMemo(() => {
    return products.map((p) => {
      const calc = calculateProductCost(p, templates, costs)
      return { ...p, ...calc }
    }).sort((a, b) => b.margin - a.margin)
  }, [products, templates, costs])

  // Component cost contribution (across all products)
  const componentContribution = useMemo(() => {
    const totals = {}
    productMetrics.forEach((p) => {
      p.componentCosts?.forEach((c) => {
        totals[c.name] = (totals[c.name] || 0) + c.total
      })
      totals['Brass/Raw Material'] = (totals['Brass/Raw Material'] || 0) + (p.rawMaterialCost || 0)
    })
    const total = Object.values(totals).reduce((s, v) => s + v, 0)
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value, pct: ((value / total) * 100).toFixed(1) }))
      .sort((a, b) => b.value - a.value)
  }, [productMetrics])

  const lossRisk = productMetrics.filter((p) => p.margin < 15)
  const profitable = productMetrics.filter((p) => p.margin >= 25)

  const reportCards = [
    { title: 'Product Profitability Report', desc: 'Full margin breakdown for all products', icon: BarChart2 },
    { title: 'Cost Breakdown Report', desc: 'Component-wise cost analysis', icon: FileText },
    { title: 'Margin Erosion Report', desc: 'Products losing margin over time', icon: TrendingDown },
    { title: 'Loss Making Products', desc: 'Products with margin < 0%', icon: AlertCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Export profitability and cost analysis reports</p>
        </div>
      </div>

      {/* Report Export Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportCards.map((r) => (
          <Card key={r.title} className="!p-4 hover:border-blue-200 transition-colors cursor-pointer group">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <r.icon size={18} className="text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">{r.title}</p>
            <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
            <div className="flex gap-2">
              <button className="flex-1 text-xs py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg font-medium transition-colors">PDF</button>
              <button className="flex-1 text-xs py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg font-medium transition-colors">Excel</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Product Profitability" subtitle="Margin % by product" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={productMetrics} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
              <YAxis dataKey="sku" type="category" width={72} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, 'Margin']} />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]} fill="#3b82f6"
                label={{ position: 'right', fontSize: 10, formatter: (v) => `${v.toFixed(0)}%` }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Component Cost Contribution" subtitle="Across all products combined" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={componentContribution} dataKey="value" nameKey="name" cx="45%" cy="50%" outerRadius={100} label={({ pct }) => `${pct}%`} labelLine={false}>
                {componentContribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Cost']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Profitable vs Risk Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <h3 className="font-semibold text-slate-800">High Margin Products (≥25%)</h3>
            <Badge variant="success" className="ml-auto">{profitable.length}</Badge>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-50">
              {profitable.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.profit)}</td>
                  <td className="px-5 py-3 text-right"><Badge variant="success">{p.margin.toFixed(1)}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <h3 className="font-semibold text-slate-800">At Risk Products (&lt;15%)</h3>
            <Badge variant="danger" className="ml-auto">{lossRisk.length}</Badge>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-50">
              {lossRisk.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.profit)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge variant={p.margin < 0 ? 'danger' : 'warning'}>{p.margin.toFixed(1)}%</Badge>
                  </td>
                </tr>
              ))}
              {lossRisk.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-slate-400 text-sm">No at-risk products</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
