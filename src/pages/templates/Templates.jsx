import { useState } from 'react'
import { Plus, Copy, Archive, Package, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../utils/calculations'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input, { Select } from '../../components/ui/Input'

export default function Templates() {
  const { templates, costs, addTemplate, updateTemplate } = useApp()
  const [expanded, setExpanded] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const rawMaterials = costs.filter((c) => c.category === 'raw_material')
  const [form, setForm] = useState({ name: '', description: '', rawMaterialId: rawMaterials[0]?.id || '', components: [] })
  const components = costs.filter((c) => c.category === 'component' || c.category === 'service')

  const getCostName = (id) => costs.find((c) => c.id === id)?.name || id
  const getCostValue = (id) => costs.find((c) => c.id === id)?.cost || 0

  const addComponent = () => {
    setForm((f) => ({
      ...f,
      components: [...f.components, { costId: components[0]?.id || '', qty: 1, type: 'fixed' }],
    }))
  }

  const updateComponent = (idx, key, val) => {
    setForm((f) => ({
      ...f,
      components: f.components.map((c, i) => (i === idx ? { ...c, [key]: val } : c)),
    }))
  }

  const removeComponent = (idx) => {
    setForm((f) => ({ ...f, components: f.components.filter((_, i) => i !== idx) }))
  }

  const handleAdd = () => {
    if (!form.name) return
    const rm = rawMaterials.find((r) => r.id === form.rawMaterialId)
    addTemplate({
      ...form,
      rawMaterial: { costId: form.rawMaterialId, name: rm?.name || '', type: 'weight' },
      components: form.components.map((c) => ({ ...c, name: getCostName(c.costId), qty: Number(c.qty) })),
    })
    setForm({ name: '', description: '', rawMaterialId: rawMaterials[0]?.id || '', components: [] })
    setAddModal(false)
  }

  const duplicate = (t) => {
    addTemplate({ ...t, name: `${t.name} (Copy)`, id: undefined })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Product Templates</h2>
          <p className="text-sm text-slate-500 mt-0.5">Reusable cost structures for product families</p>
        </div>
        <Button onClick={() => setAddModal(true)}>
          <Plus size={16} /> New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((t) => {
          const isExpanded = expanded === t.id
          const fixedCostTotal = t.components.reduce((sum, c) => sum + getCostValue(c.costId) * c.qty, 0)

          return (
            <Card key={t.id} padding={false}>
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : t.id)}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Package size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{t.name}</h3>
                    <Badge variant={t.status === 'active' ? 'success' : 'neutral'}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-slate-500">Fixed costs</p>
                  <p className="font-semibold text-slate-800">{formatCurrency(fixedCostTotal)}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-slate-500">Components</p>
                  <p className="font-semibold text-slate-800">{t.components.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); duplicate(t) }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Duplicate">
                    <Copy size={15} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); updateTemplate(t.id, { status: t.status === 'active' ? 'archived' : 'active' }) }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Archive">
                    <Archive size={15} />
                  </button>
                  {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 p-5">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Raw Material</p>
                      <div className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-800">{t.rawMaterial.name}</p>
                          <p className="text-xs text-slate-500">Weight-based · {formatCurrency(getCostValue(t.rawMaterial.costId))}/kg</p>
                        </div>
                        <Badge variant="purple">Weight Based</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Components & Services</p>
                      <div className="space-y-2">
                        {t.components.map((c, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{c.name}</p>
                              <p className="text-xs text-slate-400">Qty: {c.qty}</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{formatCurrency(getCostValue(c.costId) * c.qty)}</p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-sm font-semibold text-slate-700">Total Fixed</p>
                          <p className="text-sm font-bold text-blue-600">{formatCurrency(fixedCostTotal)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Add Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Create Template" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Template Name" placeholder="e.g. Basin Mixer" value={form.name} onChange={(e) => setForm({ ...f => f, name: e.target.value })}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Select label="Raw Material" value={form.rawMaterialId} onChange={(e) => setForm((f) => ({ ...f, rawMaterialId: e.target.value }))}>
              {rawMaterials.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.cost)}/{r.unit}</option>
              ))}
            </Select>
          </div>
          <Input label="Description" placeholder="Brief description of this template" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">Components & Services</p>
              <Button size="sm" variant="secondary" onClick={addComponent}><Plus size={14} /> Add</Button>
            </div>
            <div className="space-y-2">
              {form.components.map((comp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select className="flex-1" value={comp.costId} onChange={(e) => updateComponent(i, 'costId', e.target.value)}>
                    {components.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {formatCurrency(c.cost)}/{c.unit}</option>
                    ))}
                  </Select>
                  <Input className="w-20" type="number" placeholder="Qty" value={comp.qty} onChange={(e) => updateComponent(i, 'qty', e.target.value)} />
                  <button onClick={() => removeComponent(i)} className="p-2 text-red-400 hover:text-red-600"><Plus size={14} className="rotate-45" /></button>
                </div>
              ))}
              {form.components.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">No components added yet</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Template</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
