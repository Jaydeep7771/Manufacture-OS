// Static seed data — replace with API calls when Supabase backend is ready

export const currentUser = {
  id: 'u1',
  name: 'Rajesh Gupta',
  email: 'rajesh@gupta-fittings.com',
  role: 'owner',
  company: 'Gupta Brass Fittings Pvt. Ltd.',
  avatar: 'RG',
}

// ──────────────────────────────────────────────
// Master Costs
// ──────────────────────────────────────────────
export const masterCosts = [
  // Raw Materials
  { id: 'rm1', name: 'Brass', category: 'raw_material', unit: 'kg', cost: 700, previousCost: 650, updatedAt: '2024-04-01', history: [
    { date: '2024-01', cost: 650 }, { date: '2024-02', cost: 660 }, { date: '2024-03', cost: 680 }, { date: '2024-04', cost: 700 },
  ]},
  { id: 'rm2', name: 'Copper', category: 'raw_material', unit: 'kg', cost: 820, previousCost: 800, updatedAt: '2024-04-01', history: [
    { date: '2024-01', cost: 780 }, { date: '2024-02', cost: 795 }, { date: '2024-03', cost: 800 }, { date: '2024-04', cost: 820 },
  ]},
  { id: 'rm3', name: 'Zinc', category: 'raw_material', unit: 'kg', cost: 230, previousCost: 220, updatedAt: '2024-03-15', history: [
    { date: '2024-01', cost: 210 }, { date: '2024-02', cost: 215 }, { date: '2024-03', cost: 220 }, { date: '2024-04', cost: 230 },
  ]},
  { id: 'rm4', name: 'Steel', category: 'raw_material', unit: 'kg', cost: 85, previousCost: 82, updatedAt: '2024-03-20', history: [
    { date: '2024-01', cost: 78 }, { date: '2024-02', cost: 80 }, { date: '2024-03', cost: 82 }, { date: '2024-04', cost: 85 },
  ]},
  // Components
  { id: 'c1', name: 'Cartridge 35mm', category: 'component', unit: 'pcs', cost: 42, previousCost: 38, updatedAt: '2024-04-05', history: [
    { date: '2024-01', cost: 36 }, { date: '2024-02', cost: 38 }, { date: '2024-03', cost: 38 }, { date: '2024-04', cost: 42 },
  ]},
  { id: 'c2', name: 'Aerator', category: 'component', unit: 'pcs', cost: 18, previousCost: 18, updatedAt: '2024-02-10', history: [
    { date: '2024-01', cost: 18 }, { date: '2024-02', cost: 18 }, { date: '2024-03', cost: 18 }, { date: '2024-04', cost: 18 },
  ]},
  { id: 'c3', name: 'Handle Premium', category: 'component', unit: 'pcs', cost: 35, previousCost: 32, updatedAt: '2024-03-01', history: [
    { date: '2024-01', cost: 30 }, { date: '2024-02', cost: 32 }, { date: '2024-03', cost: 32 }, { date: '2024-04', cost: 35 },
  ]},
  { id: 'c4', name: 'Handle Standard', category: 'component', unit: 'pcs', cost: 22, previousCost: 20, updatedAt: '2024-03-01', history: [
    { date: '2024-01', cost: 18 }, { date: '2024-02', cost: 20 }, { date: '2024-03', cost: 20 }, { date: '2024-04', cost: 22 },
  ]},
  { id: 'c5', name: 'Flange', category: 'component', unit: 'pcs', cost: 25, previousCost: 25, updatedAt: '2024-01-15', history: [
    { date: '2024-01', cost: 25 }, { date: '2024-02', cost: 25 }, { date: '2024-03', cost: 25 }, { date: '2024-04', cost: 25 },
  ]},
  { id: 'c6', name: 'Check Nut', category: 'component', unit: 'pcs', cost: 8, previousCost: 8, updatedAt: '2024-01-15', history: [
    { date: '2024-01', cost: 8 }, { date: '2024-02', cost: 8 }, { date: '2024-03', cost: 8 }, { date: '2024-04', cost: 8 },
  ]},
  { id: 'c7', name: 'Body Valve', category: 'component', unit: 'pcs', cost: 55, previousCost: 50, updatedAt: '2024-04-02', history: [
    { date: '2024-01', cost: 48 }, { date: '2024-02', cost: 50 }, { date: '2024-03', cost: 50 }, { date: '2024-04', cost: 55 },
  ]},
  // Services
  { id: 's1', name: 'Chrome Plating', category: 'service', unit: 'pcs', cost: 30, previousCost: 28, updatedAt: '2024-04-01', history: [
    { date: '2024-01', cost: 26 }, { date: '2024-02', cost: 28 }, { date: '2024-03', cost: 28 }, { date: '2024-04', cost: 30 },
  ]},
  { id: 's2', name: 'Packaging', category: 'service', unit: 'pcs', cost: 22, previousCost: 20, updatedAt: '2024-03-10', history: [
    { date: '2024-01', cost: 18 }, { date: '2024-02', cost: 18 }, { date: '2024-03', cost: 20 }, { date: '2024-04', cost: 22 },
  ]},
  { id: 's3', name: 'Assembly Labour', category: 'service', unit: 'pcs', cost: 15, previousCost: 15, updatedAt: '2024-01-01', history: [
    { date: '2024-01', cost: 15 }, { date: '2024-02', cost: 15 }, { date: '2024-03', cost: 15 }, { date: '2024-04', cost: 15 },
  ]},
  { id: 's4', name: 'Quality Inspection', category: 'service', unit: 'pcs', cost: 8, previousCost: 8, updatedAt: '2024-01-01', history: [
    { date: '2024-01', cost: 8 }, { date: '2024-02', cost: 8 }, { date: '2024-03', cost: 8 }, { date: '2024-04', cost: 8 },
  ]},
]

// ──────────────────────────────────────────────
// Product Templates
// ──────────────────────────────────────────────
export const templates = [
  {
    id: 't1',
    name: 'Basin Mixer',
    description: 'Standard basin mixer faucet template',
    components: [
      { costId: 'c1', name: 'Cartridge 35mm', qty: 1, type: 'fixed' },
      { costId: 'c2', name: 'Aerator', qty: 1, type: 'fixed' },
      { costId: 'c3', name: 'Handle Premium', qty: 1, type: 'fixed' },
      { costId: 'c5', name: 'Flange', qty: 2, type: 'fixed' },
      { costId: 'c6', name: 'Check Nut', qty: 2, type: 'fixed' },
      { costId: 's1', name: 'Chrome Plating', qty: 1, type: 'fixed' },
      { costId: 's2', name: 'Packaging', qty: 1, type: 'fixed' },
      { costId: 's3', name: 'Assembly Labour', qty: 1, type: 'fixed' },
    ],
    rawMaterial: { costId: 'rm1', name: 'Brass', type: 'weight' },
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: 't2',
    name: 'Wall Mixer',
    description: 'Wall-mounted mixer tap template',
    components: [
      { costId: 'c1', name: 'Cartridge 35mm', qty: 2, type: 'fixed' },
      { costId: 'c3', name: 'Handle Premium', qty: 2, type: 'fixed' },
      { costId: 'c5', name: 'Flange', qty: 2, type: 'fixed' },
      { costId: 'c6', name: 'Check Nut', qty: 4, type: 'fixed' },
      { costId: 's1', name: 'Chrome Plating', qty: 1, type: 'fixed' },
      { costId: 's2', name: 'Packaging', qty: 1, type: 'fixed' },
      { costId: 's3', name: 'Assembly Labour', qty: 1, type: 'fixed' },
    ],
    rawMaterial: { costId: 'rm1', name: 'Brass', type: 'weight' },
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: 't3',
    name: 'Pillar Cock',
    description: 'Standard pillar cock template',
    components: [
      { costId: 'c1', name: 'Cartridge 35mm', qty: 1, type: 'fixed' },
      { costId: 'c4', name: 'Handle Standard', qty: 1, type: 'fixed' },
      { costId: 'c6', name: 'Check Nut', qty: 1, type: 'fixed' },
      { costId: 's1', name: 'Chrome Plating', qty: 1, type: 'fixed' },
      { costId: 's2', name: 'Packaging', qty: 1, type: 'fixed' },
    ],
    rawMaterial: { costId: 'rm1', name: 'Brass', type: 'weight' },
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: 't4',
    name: 'Angle Valve',
    description: 'Standard angle valve template',
    components: [
      { costId: 'c7', name: 'Body Valve', qty: 1, type: 'fixed' },
      { costId: 'c6', name: 'Check Nut', qty: 2, type: 'fixed' },
      { costId: 's1', name: 'Chrome Plating', qty: 1, type: 'fixed' },
      { costId: 's2', name: 'Packaging', qty: 1, type: 'fixed' },
    ],
    rawMaterial: { costId: 'rm1', name: 'Brass', type: 'weight' },
    status: 'active',
    createdAt: '2024-01-10',
  },
]

// ──────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────
export const products = [
  {
    id: 'p1',
    name: 'Premium Basin Mixer BM-100',
    sku: 'BM-100',
    templateId: 't1',
    templateName: 'Basin Mixer',
    brassWeight: 0.82,
    sellingPrice: 950,
    status: 'active',
    category: 'Basin Mixer',
    marginHistory: [
      { month: 'Jan', margin: 31.2 }, { month: 'Feb', margin: 30.8 }, { month: 'Mar', margin: 29.5 }, { month: 'Apr', margin: 27.8 },
    ],
  },
  {
    id: 'p2',
    name: 'Economy Basin Mixer BM-200',
    sku: 'BM-200',
    templateId: 't1',
    templateName: 'Basin Mixer',
    brassWeight: 0.75,
    sellingPrice: 780,
    status: 'active',
    category: 'Basin Mixer',
    marginHistory: [
      { month: 'Jan', margin: 28.5 }, { month: 'Feb', margin: 27.9 }, { month: 'Mar', margin: 26.2 }, { month: 'Apr', margin: 24.6 },
    ],
  },
  {
    id: 'p3',
    name: 'Wall Mixer WM-300',
    sku: 'WM-300',
    templateId: 't2',
    templateName: 'Wall Mixer',
    brassWeight: 1.20,
    sellingPrice: 1450,
    status: 'active',
    category: 'Wall Mixer',
    marginHistory: [
      { month: 'Jan', margin: 34.1 }, { month: 'Feb', margin: 33.5 }, { month: 'Mar', margin: 32.0 }, { month: 'Apr', margin: 30.2 },
    ],
  },
  {
    id: 'p4',
    name: 'Pillar Cock PC-400',
    sku: 'PC-400',
    templateId: 't3',
    templateName: 'Pillar Cock',
    brassWeight: 0.45,
    sellingPrice: 480,
    status: 'active',
    category: 'Pillar Cock',
    marginHistory: [
      { month: 'Jan', margin: 25.3 }, { month: 'Feb', margin: 24.8 }, { month: 'Mar', margin: 23.1 }, { month: 'Apr', margin: 21.9 },
    ],
  },
  {
    id: 'p5',
    name: 'Economy Pillar Cock PC-500',
    sku: 'PC-500',
    templateId: 't3',
    templateName: 'Pillar Cock',
    brassWeight: 0.38,
    sellingPrice: 350,
    status: 'active',
    category: 'Pillar Cock',
    marginHistory: [
      { month: 'Jan', margin: 19.2 }, { month: 'Feb', margin: 18.5 }, { month: 'Mar', margin: 16.8 }, { month: 'Apr', margin: 14.5 },
    ],
  },
  {
    id: 'p6',
    name: 'Angle Valve AV-600',
    sku: 'AV-600',
    templateId: 't4',
    templateName: 'Angle Valve',
    brassWeight: 0.30,
    sellingPrice: 280,
    status: 'active',
    category: 'Angle Valve',
    marginHistory: [
      { month: 'Jan', margin: 18.5 }, { month: 'Feb', margin: 17.2 }, { month: 'Mar', margin: 14.8 }, { month: 'Apr', margin: 11.4 },
    ],
  },
  {
    id: 'p7',
    name: 'Premium Angle Valve AV-700',
    sku: 'AV-700',
    templateId: 't4',
    templateName: 'Angle Valve',
    brassWeight: 0.35,
    sellingPrice: 380,
    status: 'active',
    category: 'Angle Valve',
    marginHistory: [
      { month: 'Jan', margin: 26.0 }, { month: 'Feb', margin: 25.3 }, { month: 'Mar', margin: 23.8 }, { month: 'Apr', margin: 22.1 },
    ],
  },
  {
    id: 'p8',
    name: 'Deluxe Wall Mixer WM-800',
    sku: 'WM-800',
    templateId: 't2',
    templateName: 'Wall Mixer',
    brassWeight: 1.45,
    sellingPrice: 1850,
    status: 'active',
    category: 'Wall Mixer',
    marginHistory: [
      { month: 'Jan', margin: 38.2 }, { month: 'Feb', margin: 37.5 }, { month: 'Mar', margin: 36.1 }, { month: 'Apr', margin: 34.3 },
    ],
  },
]

// ──────────────────────────────────────────────
// Alerts
// ──────────────────────────────────────────────
export const alerts = [
  {
    id: 'a1',
    type: 'margin_drop',
    severity: 'critical',
    title: 'Economy Pillar Cock PC-500 margin dropped below 15%',
    description: 'Current margin is 14.5%. Recommended action: increase selling price by ₹30 to maintain 20% margin.',
    productId: 'p5',
    productName: 'Economy Pillar Cock PC-500',
    createdAt: '2024-04-06',
    isRead: false,
  },
  {
    id: 'a2',
    type: 'cost_increase',
    severity: 'warning',
    title: 'Brass price increased by 7.7%',
    description: 'Brass cost moved from ₹650 to ₹700/kg. This affects 8 products across your portfolio.',
    costId: 'rm1',
    costName: 'Brass',
    createdAt: '2024-04-01',
    isRead: false,
  },
  {
    id: 'a3',
    type: 'cost_increase',
    severity: 'warning',
    title: 'Cartridge 35mm price increased by 10.5%',
    description: 'Cartridge cost moved from ₹38 to ₹42. Affects 6 products.',
    costId: 'c1',
    costName: 'Cartridge 35mm',
    createdAt: '2024-04-05',
    isRead: false,
  },
  {
    id: 'a4',
    type: 'margin_drop',
    severity: 'warning',
    title: 'Angle Valve AV-600 margin below threshold',
    description: 'Current margin 11.4% is below your 15% threshold. Review pricing.',
    productId: 'p6',
    productName: 'Angle Valve AV-600',
    createdAt: '2024-04-06',
    isRead: true,
  },
  {
    id: 'a5',
    type: 'price_revision',
    severity: 'info',
    title: '3 products need price revision',
    description: 'Premium Basin Mixer, Economy Pillar Cock, and Angle Valve AV-600 require price updates to maintain target margins.',
    createdAt: '2024-04-06',
    isRead: true,
  },
]

// ──────────────────────────────────────────────
// Margin trend (dashboard)
// ──────────────────────────────────────────────
export const marginTrendData = [
  { month: 'Nov', avgMargin: 32.1, avgCost: 580 },
  { month: 'Dec', avgMargin: 31.8, avgCost: 588 },
  { month: 'Jan', avgMargin: 30.9, avgCost: 598 },
  { month: 'Feb', avgMargin: 30.2, avgCost: 610 },
  { month: 'Mar', avgMargin: 28.5, avgCost: 628 },
  { month: 'Apr', avgMargin: 26.8, avgCost: 652 },
]
