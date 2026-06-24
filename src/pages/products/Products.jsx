import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../../context/AppContext'
import { calculateProductCost, calculateRecommendedPrice, formatCurrency, getMarginVariant } from '../../utils/calculations'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input, { Select } from '../../components/ui/Input'

export default function Products() {
  const { products, templates, costs, addProduct, deleteProduct } = useApp()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [sortBy, setSortBy] = useState('margin_desc')
  const [addModal, setAddModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [form, setForm] = useState({ name: '', sku: '', templateId: '', brassWeight: '', sellingPrice: '', category: '' })

  const productMetrics = useMemo(() => {
    return products.map((p) => {
      const calc = calculateProductCost(p, templates, costs)
      const recPrice = calculateRecommendedPrice(p, templates, costs, 25)
      return { ...p, ...calc, recommendedPrice: recPrice }
    })
  }, [products, templates, costs])

  const categories = [...new Set(products.map((p) => p.category))]

  const filtered = useMemo(() => {
    let list = productMetrics.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCat === 'all' || p.category === filterCat
      return matchSearch && matchCat
    })
    switch (sortBy) {
      case 'margin_desc': list = list.sort((a, b) => b.margin - a.margin); break
      case 'margin_asc': list = list.sort((a, b) => a.margin - b.margin); break
      case 'profit_desc': list = list.sort((a, b) => b.profit - a.profit); break
      case 'name_asc': list = list.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [productMetrics, search, filterCat, sortBy])

  const handleAdd = () => {
    if (!form.name || !form.templateId || !form.sellingPrice) return
    const template = templates.find((t) => t.id === form.templateId)
    addProduct({
      ...form,
      brassWeight: parseFloat(form.brassWeight) || 0,
      sellingPrice: parseFloat(form.sellingPrice),
      category: form.category || template?.name || '',
      templateName: template?.name || '',
    })
    setForm({ name: '', sku: '', templateId: '', brassWeight: '', sellingPrice: '', category: '' })
    setAddModal(false)
  }

  const latestMarginTrend = (p) => {
    if (!p.marginHistory || p.marginHistory.length < 2) return 0
    const h = p.marginHistory
    return h[h.length - 1].margin - h[h.length - 2].margin
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products</h2>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products · Costed automatically from templates</p>
        </div>
        <Button onClick={() => setAddModal(true)}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-52"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filterCat === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="ml-auto text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="margin_desc">Margin: High → Low</option>
          <option value="margin_asc">Margin: Low → High</option>
          <option value="profit_desc">Profit: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
        </select>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Raw Material</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Cost</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Selling Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Profit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Margin</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trend</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const trend = latestMarginTrend(p)
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.sku} · {p.templateName} · {p.brassWeight}kg brass</p>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600">{formatCurrency(p.rawMaterialCost)}</td>
                    <td className="px-4 py-4 text-right font-medium text-slate-700">{formatCurrency(p.totalCost)}</td>
                    <td className="px-4 py-4 text-right text-slate-700">{formatCurrency(p.sellingPrice)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-800">{formatCurrency(p.profit)}</td>
                    <td className="px-4 py-4 text-right">
                      <Badge variant={getMarginVariant(p.margin)}>{p.margin.toFixed(1)}%</Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`flex items-center justify-end gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setDetailModal(p)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Product" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Product Name" placeholder="e.g. Premium Basin Mixer" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="SKU" placeholder="e.g. BM-100" value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </div>
          <Select label="Template" value={form.templateId} onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}>
            <option value="">Select template...</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Brass Weight (kg)" type="number" placeholder="0.82" suffix="kg" value={form.brassWeight}
              onChange={(e) => setForm((f) => ({ ...f, brassWeight: e.target.value }))} />
            <Input label="Selling Price (₹)" type="number" prefix="₹" placeholder="950" value={form.sellingPrice}
              onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))} />
          </div>
          <Input label="Category" placeholder="e.g. Basin Mixer" value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Product</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detailModal && (
        <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal.name} size="lg">
          <div className="space-y-5">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Cost', value: formatCurrency(detailModal.totalCost) },
                { label: 'Selling Price', value: formatCurrency(detailModal.sellingPrice) },
                { label: 'Profit', value: formatCurrency(detailModal.profit) },
                { label: 'Margin', value: `${detailModal.margin.toFixed(1)}%` },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Cost Breakdown</p>
              <div className="space-y-1.5">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Brass ({detailModal.brassWeight}kg × {formatCurrency(costs.find(c=>c.id==='rm1')?.cost||0)}/kg)</span>
                  <span className="text-sm font-medium text-slate-800">{formatCurrency(detailModal.rawMaterialCost)}</span>
                </div>
                {detailModal.componentCosts?.map((c, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-600">{c.name} × {c.qty}</span>
                    <span className="text-sm font-medium text-slate-800">{formatCurrency(c.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold">
                  <span className="text-slate-800">Total Cost</span>
                  <span className="text-blue-600">{formatCurrency(detailModal.totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Margin Trend */}
            {detailModal.marginHistory?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Margin Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={detailModal.marginHistory}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Margin']} />
                    <Line type="monotone" dataKey="margin" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recommended Price */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-800">Recommended Price (25% target margin)</p>
                <p className="text-xs text-blue-600 mt-0.5">To maintain a healthy 25% margin</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(detailModal.recommendedPrice)}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
