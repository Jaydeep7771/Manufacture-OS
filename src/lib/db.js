import { supabase } from './supabase'

// ============================================================
// Data-access layer for FinanceOS.
// Translates between the Supabase (snake_case) schema and the
// camelCase shapes the React app/calculation engine expect.
// All reads are company-scoped automatically by Row Level Security.
// ============================================================

const fmtDate = (ts) => (ts ? new Date(ts).toISOString().split('T')[0] : '')

// ---- DB row -> app shape ----
function mapCost(row, historyByCost) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    cost: Number(row.cost),
    previousCost: row.previous_cost != null ? Number(row.previous_cost) : Number(row.cost),
    updatedAt: fmtDate(row.updated_at),
    history: historyByCost[row.id] || [],
  }
}

function mapTemplate(row, costNameById) {
  const components = (row.template_components || []).map((tc) => ({
    costId: tc.cost_id,
    name: costNameById[tc.cost_id] || '',
    qty: Number(tc.qty),
    type: tc.type || 'fixed',
  }))
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    rawMaterial: { costId: row.raw_material_id, name: costNameById[row.raw_material_id] || '', type: 'weight' },
    components,
    status: row.status,
    createdAt: fmtDate(row.created_at),
  }
}

function mapProduct(row, templateNameById) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    templateId: row.template_id,
    templateName: templateNameById[row.template_id] || '',
    brassWeight: Number(row.brass_weight) || 0,
    sellingPrice: Number(row.selling_price),
    status: row.status,
    category: row.category,
    // No margin-history table in the schema yet — Trends/sparklines stay empty
    // until one is added. See README/migration notes.
    marginHistory: [],
  }
}

function mapAlert(row) {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    productId: row.product_id,
    costId: row.cost_id,
    createdAt: fmtDate(row.created_at),
    isRead: row.is_read,
  }
}

// ---- Reads: load everything for the current company in one shot ----
export async function fetchAll() {
  const [costsRes, histRes, tmplRes, prodRes, alertRes] = await Promise.all([
    supabase.from('master_costs').select('*').eq('is_deleted', false).order('created_at'),
    supabase.from('cost_history').select('*').order('recorded_at'),
    supabase.from('templates').select('*, template_components(*)').eq('is_deleted', false).order('created_at'),
    supabase.from('products').select('*').eq('is_deleted', false).order('created_at'),
    supabase.from('alerts').select('*').order('created_at', { ascending: false }),
  ])

  const firstError = costsRes.error || histRes.error || tmplRes.error || prodRes.error || alertRes.error
  if (firstError) throw firstError

  const historyByCost = {}
  for (const h of histRes.data || []) {
    if (!historyByCost[h.cost_id]) historyByCost[h.cost_id] = []
    historyByCost[h.cost_id].push({ date: h.recorded_at, cost: Number(h.cost) })
  }

  const costs = (costsRes.data || []).map((c) => mapCost(c, historyByCost))
  const costNameById = Object.fromEntries(costs.map((c) => [c.id, c.name]))

  const templates = (tmplRes.data || []).map((t) => mapTemplate(t, costNameById))
  const templateNameById = Object.fromEntries(templates.map((t) => [t.id, t.name]))

  const products = (prodRes.data || []).map((p) => mapProduct(p, templateNameById))
  const alerts = (alertRes.data || []).map(mapAlert)

  return { costs, templates, products, alerts }
}

// ---- Writes ----
export async function addCost(companyId, d) {
  const { error } = await supabase.from('master_costs').insert({
    company_id: companyId,
    name: d.name,
    category: d.category,
    unit: d.unit,
    cost: d.cost,
    previous_cost: d.cost,
  })
  if (error) throw error
}

export async function updateCost(id, newCost) {
  // Capture the current value as previous_cost; the DB trigger logs history.
  const { data, error: readErr } = await supabase.from('master_costs').select('cost').eq('id', id).single()
  if (readErr) throw readErr
  const { error } = await supabase
    .from('master_costs')
    .update({ cost: newCost, previous_cost: data.cost, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCost(id) {
  const { error } = await supabase.from('master_costs').update({ is_deleted: true }).eq('id', id)
  if (error) throw error
}

export async function addTemplate(companyId, d) {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      company_id: companyId,
      name: d.name,
      description: d.description,
      raw_material_id: d.rawMaterialId || d.rawMaterial?.costId || null,
    })
    .select()
    .single()
  if (error) throw error

  const components = (d.components || []).map((c) => ({
    template_id: data.id,
    cost_id: c.costId,
    qty: c.qty,
    type: c.type || 'fixed',
  }))
  if (components.length) {
    const { error: compErr } = await supabase.from('template_components').insert(components)
    if (compErr) throw compErr
  }
}

export async function updateTemplate(id, d) {
  const patch = {}
  if (d.name !== undefined) patch.name = d.name
  if (d.description !== undefined) patch.description = d.description
  if (d.status !== undefined) patch.status = d.status
  if (d.rawMaterialId !== undefined) patch.raw_material_id = d.rawMaterialId
  const { error } = await supabase.from('templates').update(patch).eq('id', id)
  if (error) throw error
}

export async function addProduct(companyId, d) {
  const { error } = await supabase.from('products').insert({
    company_id: companyId,
    template_id: d.templateId || null,
    name: d.name,
    sku: d.sku,
    category: d.category,
    brass_weight: d.brassWeight || 0,
    selling_price: d.sellingPrice,
  })
  if (error) throw error
}

export async function updateProduct(id, d) {
  const patch = {}
  if (d.name !== undefined) patch.name = d.name
  if (d.sku !== undefined) patch.sku = d.sku
  if (d.category !== undefined) patch.category = d.category
  if (d.brassWeight !== undefined) patch.brass_weight = d.brassWeight
  if (d.sellingPrice !== undefined) patch.selling_price = d.sellingPrice
  if (d.templateId !== undefined) patch.template_id = d.templateId
  const { error } = await supabase.from('products').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').update({ is_deleted: true }).eq('id', id)
  if (error) throw error
}

export async function markAlertRead(id) {
  const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', id)
  if (error) throw error
}
