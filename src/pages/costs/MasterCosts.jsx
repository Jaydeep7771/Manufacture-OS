import { useState, useMemo } from 'react'
import { Plus, Search, TrendingUp, Edit2, Trash2, History } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../utils/calculations'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input, { Select } from '../../components/ui/Input'

const categoryMeta = {
  raw_material: { label: 'Raw Material', variant: 'purple' },
  component: { label: 'Component', variant: 'info' },
  service: { label: 'Service', variant: 'neutral' },
}

export default function MasterCosts() {
  const { costs, updateCost, addCost, deleteCost } = useApp()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [historyModal, setHistoryModal] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'raw_material', unit: 'pcs', cost: '' })
  const [editCost, setEditCost] = useState('')

  const filtered = useMemo(() => {
    return costs.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCat === 'all' || c.category === filterCat
      return matchSearch && matchCat
    })
  }, [costs, search, filterCat])

  const groups = {
    raw_material: filtered.filter((c) => c.category === 'raw_material'),
    component: filtered.filter((c) => c.category === 'component'),
    service: filtered.filter((c) => c.category === 'service'),
  }

  const handleAdd = () => {
    if (!form.name || !form.cost) return
    addCost({ ...form, cost: parseFloat(form.cost) })
    setForm({ name: '', category: 'raw_material', unit: 'pcs', cost: '' })
    setAddModal(false)
  }

  const handleEdit = () => {
    if (!editCost) return
    updateCost(editModal.id, parseFloat(editCost))
    setEditModal(null)
    setEditCost('')
  }

  const changePercent = (c) => {
    if (!c.previousCost || c.previousCost === c.cost) return null
    return (((c.cost - c.previousCost) / c.previousCost) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Cost Sheet</h2>
          <p className="text-sm text-slate-500 mt-0.5">Single source of truth for all material and service costs</p>
        </div>
        <Button onClick={() => setAddModal(true)}>
          <Plus size={16} /> Add Cost Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search costs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-52"
          />
        </div>
        {['all', 'raw_material', 'component', 'service'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              filterCat === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All' : categoryMeta[cat].label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(groups).map(([cat, items]) => (
          <Card key={cat} className="!p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{categoryMeta[cat].label}s</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{items.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">items tracked</p>
          </Card>
        ))}
      </div>

      {/* Cost Tables by Category */}
      {Object.entries(groups).map(([cat, items]) => {
        if (!items.length) return null
        return (
          <Card padding={false} key={cat}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">{categoryMeta[cat].label}s</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Current Cost</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Change</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Last Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((c) => {
                  const pct = changePercent(c)
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-800">{c.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{c.unit}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                        {formatCurrency(c.cost)}<span className="text-xs text-slate-400 font-normal">/{c.unit}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {pct !== null ? (
                          <span className={`flex items-center justify-end gap-1 text-xs font-medium ${parseFloat(pct) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            <TrendingUp size={12} />
                            {parseFloat(pct) > 0 ? '+' : ''}{pct}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-400 text-xs">{c.updatedAt}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setHistoryModal(c)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="History">
                            <History size={14} />
                          </button>
                          <button onClick={() => { setEditModal(c); setEditCost(c.cost) }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteCost(c.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )
      })}

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Cost Item">
        <div className="space-y-4">
          <Input label="Item Name" placeholder="e.g. Brass, Cartridge 35mm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="raw_material">Raw Material</option>
            <option value="component">Component</option>
            <option value="service">Service</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
              <option value="ltr">ltr</option>
              <option value="mtr">mtr</option>
            </Select>
            <Input label="Cost (₹)" type="number" prefix="₹" placeholder="0.00" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Item</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Update Cost — ${editModal?.name}`} size="sm">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Previous cost</p>
            <p className="text-lg font-bold text-slate-700">{formatCurrency(editModal?.previousCost || 0)}/{editModal?.unit}</p>
          </div>
          <Input label="New Cost (₹)" type="number" prefix="₹" value={editCost} onChange={(e) => setEditCost(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Update Cost</Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)} title={`Cost History — ${historyModal?.name}`} size="sm">
        {historyModal && (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={historyModal.history}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Cost']} />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs text-slate-500">Month</th>
                  <th className="text-right py-2 text-xs text-slate-500">Cost</th>
                </tr>
              </thead>
              <tbody>
                {[...historyModal.history].reverse().map((h, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2 text-slate-600">{h.date}</td>
                    <td className="py-2 text-right font-medium text-slate-800">{formatCurrency(h.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}
