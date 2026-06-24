// Build a fast id → cost lookup from the live costs array.
const buildCostMap = (costs) => {
  const map = new Map()
  for (const c of costs) map.set(c.id, c.cost)
  return map
}

export function calculateProductCost(product, templates, costs, overrideCosts = {}) {
  const template = templates.find((t) => t.id === product.templateId)
  if (!template) return null

  const costMap = buildCostMap(costs)
  const getCost = (id) => {
    if (overrideCosts[id] !== undefined) return overrideCosts[id]
    return costMap.get(id) ?? 0
  }

  // Raw material (weight-based)
  const brassCost = getCost(template.rawMaterial.costId)
  const rawMaterialTotal = (product.brassWeight || 0) * brassCost

  // Components (fixed qty)
  const componentBreakdown = template.components.map((comp) => {
    const unitCost = getCost(comp.costId)
    const total = unitCost * comp.qty
    return { ...comp, unitCost, total }
  })
  const componentTotal = componentBreakdown.reduce((sum, c) => sum + c.total, 0)

  const totalCost = rawMaterialTotal + componentTotal
  const profit = product.sellingPrice - totalCost
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0

  return {
    rawMaterialCost: rawMaterialTotal,
    componentCosts: componentBreakdown,
    totalCost,
    profit,
    margin,
    sellingPrice: product.sellingPrice,
  }
}

export function calculateRecommendedPrice(product, templates, costs, targetMargin) {
  const result = calculateProductCost(product, templates, costs)
  if (!result) return null

  // Price to achieve target margin: price = cost / (1 - margin/100)
  const recommendedPrice = result.totalCost / (1 - targetMargin / 100)
  return Math.ceil(recommendedPrice / 5) * 5 // round up to nearest ₹5
}

// Margin → Badge variant (shared across product tables, comparison and simulator)
export function getMarginVariant(margin) {
  if (margin >= 30) return 'success'
  if (margin >= 20) return 'info'
  if (margin >= 10) return 'warning'
  return 'danger'
}

export function getMarginClass(margin) {
  if (margin >= 30) return 'text-emerald-600'
  if (margin >= 20) return 'text-blue-600'
  if (margin >= 10) return 'text-amber-600'
  return 'text-red-600'
}

export function getMarginBadgeClass(margin) {
  if (margin >= 30) return 'bg-emerald-100 text-emerald-700'
  if (margin >= 20) return 'bg-blue-100 text-blue-700'
  if (margin >= 10) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
