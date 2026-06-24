import { useState, useMemo } from 'react'
import { TrendingDown, TrendingUp, RotateCcw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { calculateProductCost, getMarginVariant } from '../../utils/calculations'
import Card, { CardHeader } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function Simulator() {
  const { costs, products, templates } = useApp()
  const [overrides, setOverrides] = useState({})

  const productComparison = useMemo(() => {
    return products.map((p) => {
      const current = calculateProductCost(p, templates, costs)
      const simulated = calculateProductCost(p, templates, costs, overrides)
      return {
        ...p,
        currentMargin: current?.margin || 0,
        currentCost: current?.totalCost || 0,
        simMargin: simulated?.margin || 0,
        simCost: simulated?.totalCost || 0,
        marginDelta: (simulated?.margin || 0) - (current?.margin || 0),
        costDelta: (simulated?.totalCost || 0) - (current?.totalCost || 0),
      }
    }).sort((a, b) => a.marginDelta - b.marginDelta)
  }, [products, templates, costs, overrides])

  const reset = () => setOverrides({})
  const hasChanges = Object.keys(overrides).length > 0

  const brassCost = costs.find(c => c.category === 'raw_material' && c.name.toLowerCase().includes('brass') && !c.name.toLowerCase().includes('scrap'))
  const brassId = brassCost?.id
  const scenarioPresets = [
    { label: 'Brass +10%', changes: brassId ? { [brassId]: Math.round(brassCost.cost * 1.10) } : {} },
    { label: 'Brass +20%', changes: brassId ? { [brassId]: Math.round(brassCost.cost * 1.20) } : {} },
    { label: 'All costs +5%', changes: Object.fromEntries(costs.map(c => [c.id, Math.round(c.cost * 1.05)])) },
    { label: 'Brass -5%',  changes: brassId ? { [brassId]: Math.round(brassCost.cost * 0.95) } : {} },
  ]

  const affectedCount = productComparison.filter((p) => Math.abs(p.marginDelta) > 0.01).length
  const avgMarginImpact = hasChanges
    ? (productComparison.reduce((s, p) => s + p.marginDelta, 0) / productComparison.length).toFixed(2)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Scenario Simulator</h2>
          <p className="text-sm text-slate-500 mt-0.5">What-if analysis — adjust costs and see instant impact on all products</p>
        </div>
        {hasChanges && (
          <Button variant="secondary" onClick={reset}><RotateCcw size={15} /> Reset</Button>
        )}
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Scenarios</p>
        <div className="flex gap-2 flex-wrap">
          {scenarioPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setOverrides(preset.changes)}
              className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Adjust Costs" subtitle="Slide or type new values" />
            <div className="space-y-4">
              {costs.map((c) => {
                const override = overrides[c.id]
                const current = override !== undefined ? override : c.cost
                const pctChange = override !== undefined ? (((override - c.cost) / c.cost) * 100).toFixed(1) : null

                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-slate-700">{c.name}</label>
                      <div className="flex items-center gap-2">
                        {pctChange !== null && (
                          <span className={`text-xs font-medium ${parseFloat(pctChange) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {parseFloat(pctChange) > 0 ? '+' : ''}{pctChange}%
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{c.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={Math.round(c.cost * 0.5)}
                        max={Math.round(c.cost * 2)}
                        step={c.unit === 'kg' ? 10 : 1}
                        value={current}
                        onChange={(e) => setOverrides((o) => ({ ...o, [c.id]: Number(e.target.value) }))}
                        className="flex-1 accent-blue-600"
                      />
                      <input
                        type="number"
                        value={current}
                        onChange={(e) => setOverrides((o) => ({ ...o, [c.id]: Number(e.target.value) }))}
                        className="w-20 text-sm text-right border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                      <span>Current: ₹{c.cost}</span>
                      {override !== undefined && override !== c.cost && (
                        <button onClick={() => {
                          const next = { ...overrides }
                          delete next[c.id]
                          setOverrides(next)
                        }} className="text-blue-500 hover:underline">Reset</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Impact Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          {hasChanges && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-amber-600 uppercase">Products Affected</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{affectedCount}</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${parseFloat(avgMarginImpact) < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`text-xs font-semibold uppercase ${parseFloat(avgMarginImpact) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>Avg Margin Change</p>
                <p className={`text-3xl font-bold mt-1 ${parseFloat(avgMarginImpact) < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {parseFloat(avgMarginImpact) > 0 ? '+' : ''}{avgMarginImpact}%
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-xs font-semibold text-blue-600 uppercase">Below 20% Margin</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {productComparison.filter((p) => p.simMargin < 20).length}
                </p>
              </div>
            </div>
          )}

          {/* Product Impact Table */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Product Impact</h3>
              <p className="text-xs text-slate-500 mt-0.5">{hasChanges ? 'Showing simulated vs current margins' : 'Adjust costs on the left to see impact'}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Current Margin</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">New Margin</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productComparison.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.simMargin < 0 ? 'bg-red-50' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Badge variant={getMarginVariant(p.currentMargin)}>{p.currentMargin.toFixed(1)}%</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Badge variant={getMarginVariant(p.simMargin)}>{p.simMargin.toFixed(1)}%</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {Math.abs(p.marginDelta) > 0.01 ? (
                        <span className={`flex items-center justify-end gap-1 text-sm font-semibold ${p.marginDelta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {p.marginDelta < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                          {p.marginDelta > 0 ? '+' : ''}{p.marginDelta.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">No change</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  )
}
