import { useMemo } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useApp } from '../../context/AppContext'
import Card, { CardHeader } from '../../components/ui/Card'
import { marginTrendData } from '../../data/staticData'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Trends() {
  const { products } = useApp()

  const productTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr']
    return months.map((month) => {
      const entry = { month }
      products.forEach((p) => {
        const history = p.marginHistory?.find((h) => h.month === month)
        if (history) entry[p.sku] = history.margin
      })
      return entry
    })
  }, [products])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Margin Trends</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track how margins have evolved over time across your portfolio</p>
      </div>

      {/* Overall Trend */}
      <Card>
        <CardHeader title="Portfolio Average Margin" subtitle="Nov 2023 – Apr 2024" />
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={marginTrendData}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} domain={[20, 40]} />
            <Tooltip formatter={(v) => [`${v}%`, 'Avg Margin']} />
            <Area type="monotone" dataKey="avgMargin" stroke="#3b82f6" strokeWidth={2.5} fill="url(#grad1)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Per-Product Trend */}
      <Card>
        <CardHeader title="Product-wise Margin Trend" subtitle="Jan – Apr 2024" />
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={productTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => v ? [`${v}%`, ''] : ['-', '']} />
            <Legend />
            {products.map((p, i) => (
              <Line key={p.sku} type="monotone" dataKey={p.sku} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Margin Erosion Table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Margin Erosion Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">Jan to Apr 2024 change</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jan Margin</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Apr Margin</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Erosion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((p) => {
              const jan = p.marginHistory?.find((h) => h.month === 'Jan')?.margin || 0
              const apr = p.marginHistory?.find((h) => h.month === 'Apr')?.margin || 0
              const erosion = apr - jan
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600">{jan.toFixed(1)}%</td>
                  <td className="px-4 py-3.5 text-right text-slate-600">{apr.toFixed(1)}%</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-semibold ${erosion < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {erosion > 0 ? '+' : ''}{erosion.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
