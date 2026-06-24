import { useState, useMemo, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { calculateProductCost, formatCurrency, getMarginVariant } from '../../utils/calculations'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'

export default function Compare() {
  const { products, templates, costs } = useApp()
  const [productA, setProductA] = useState(products[0]?.id || '')
  const [productB, setProductB] = useState(products[2]?.id || '')

  const getMetrics = useCallback((id) => {
    const p = products.find((p) => p.id === id)
    if (!p) return null
    const calc = calculateProductCost(p, templates, costs)
    return { ...p, ...calc }
  }, [products, templates, costs])

  const a = useMemo(() => getMetrics(productA), [productA, getMetrics])
  const b = useMemo(() => getMetrics(productB), [productB, getMetrics])

  const rows = [
    { label: 'SKU', key: 'sku', format: (v) => v },
    { label: 'Template', key: 'templateName', format: (v) => v },
    { label: 'Brass Weight', key: 'brassWeight', format: (v) => `${v} kg` },
    { label: 'Raw Material Cost', key: 'rawMaterialCost', format: formatCurrency },
    { label: 'Total Cost', key: 'totalCost', format: formatCurrency },
    { label: 'Selling Price', key: 'sellingPrice', format: formatCurrency },
    { label: 'Profit / Unit', key: 'profit', format: formatCurrency },
    { label: 'Margin %', key: 'margin', format: (v) => `${v?.toFixed(1)}%` },
  ]

  const winner = (key) => {
    if (!a || !b) return null
    if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      return a[key] > b[key] ? 'A' : b[key] > a[key] ? 'B' : null
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Product Comparison</h2>
        <p className="text-sm text-slate-500 mt-0.5">Compare cost, margin, and profitability between two products</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <Select label="Product A" value={productA} onChange={(e) => setProductA(e.target.value)}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Product B" value={productB} onChange={(e) => setProductB(e.target.value)}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </div>

      {a && b && (
        <>
          {/* Header Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {[a, b].map((p, idx) => (
              <Card key={idx} className={`border-2 ${idx === 0 ? 'border-blue-200' : 'border-emerald-200'}`}>
                <div className={`w-full h-1 rounded-full mb-4 ${idx === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Product {idx === 0 ? 'A' : 'B'}</p>
                <h3 className="font-bold text-slate-800 text-lg">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{p.sku}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Margin</p>
                    <Badge variant={getMarginVariant(p.margin)} className="mt-0.5">{p.margin.toFixed(1)}%</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Cost</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(p.totalCost)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Profit</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(p.profit)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Side-by-Side Comparison</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Metric</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-blue-600 uppercase">Product A</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-emerald-600 uppercase">Product B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => {
                  const w = winner(row.key)
                  return (
                    <tr key={row.key} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-slate-700">{row.label}</td>
                      <td className={`px-4 py-3.5 text-right font-medium ${w === 'A' ? 'text-blue-700' : 'text-slate-600'}`}>
                        {row.format(a[row.key])}
                        {w === 'A' && <span className="ml-1.5 text-xs text-blue-500">▲</span>}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-medium ${w === 'B' ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {row.format(b[row.key])}
                        {w === 'B' && <span className="ml-1.5 text-xs text-emerald-500">▲</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
