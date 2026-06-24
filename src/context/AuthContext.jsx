import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*, companies(*)').eq('id', userId).single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchProfile(data.session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, fullName, companyName }) => {
    // 1. Create the auth user (a profile row is created by the DB trigger).
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (authError) throw authError

    // If email confirmation is on, there is no session yet — we can't run the
    // authenticated setup below. Tell the user to confirm and sign in.
    if (!authData.session) {
      throw new Error(
        'Account created. Please check your email to confirm, then sign in. ' +
          '(To skip this step, disable "Confirm email" in Supabase → Authentication → Providers → Email.)'
      )
    }

    // 2. Create the company + attach this user, via a SECURITY DEFINER RPC
    //    (a plain insert would be blocked by RLS before a company exists).
    const { data: companyId, error: rpcError } = await supabase.rpc('create_company_and_join', {
      company_name: companyName,
    })
    if (rpcError) throw rpcError

    // 3. Seed starter data (costs, templates, products, alerts) for the company.
    await seedDefaultData(companyId)

    // 4. Refresh the profile so company_id is available immediately.
    await fetchProfile(authData.user.id)

    return authData
  }

  const signIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const loading = session === undefined

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

// ──────────────────────────────────────────────
// Seed default data for a brand-new company
// ──────────────────────────────────────────────
async function seedDefaultData(companyId) {
  // Insert master costs
  const { data: costs } = await supabase.from('master_costs').insert([
    { company_id: companyId, name: 'Brass', category: 'raw_material', unit: 'kg', cost: 700, previous_cost: 650 },
    { company_id: companyId, name: 'Copper', category: 'raw_material', unit: 'kg', cost: 820, previous_cost: 800 },
    { company_id: companyId, name: 'Zinc', category: 'raw_material', unit: 'kg', cost: 230, previous_cost: 220 },
    { company_id: companyId, name: 'Steel', category: 'raw_material', unit: 'kg', cost: 85, previous_cost: 82 },
    { company_id: companyId, name: 'Cartridge 35mm', category: 'component', unit: 'pcs', cost: 42, previous_cost: 38 },
    { company_id: companyId, name: 'Aerator', category: 'component', unit: 'pcs', cost: 18, previous_cost: 18 },
    { company_id: companyId, name: 'Handle Premium', category: 'component', unit: 'pcs', cost: 35, previous_cost: 32 },
    { company_id: companyId, name: 'Handle Standard', category: 'component', unit: 'pcs', cost: 22, previous_cost: 20 },
    { company_id: companyId, name: 'Flange', category: 'component', unit: 'pcs', cost: 25, previous_cost: 25 },
    { company_id: companyId, name: 'Check Nut', category: 'component', unit: 'pcs', cost: 8, previous_cost: 8 },
    { company_id: companyId, name: 'Body Valve', category: 'component', unit: 'pcs', cost: 55, previous_cost: 50 },
    { company_id: companyId, name: 'Chrome Plating', category: 'service', unit: 'pcs', cost: 30, previous_cost: 28 },
    { company_id: companyId, name: 'Packaging', category: 'service', unit: 'pcs', cost: 22, previous_cost: 20 },
    { company_id: companyId, name: 'Assembly Labour', category: 'service', unit: 'pcs', cost: 15, previous_cost: 15 },
    { company_id: companyId, name: 'Quality Inspection', category: 'service', unit: 'pcs', cost: 8, previous_cost: 8 },
  ]).select()

  if (!costs) return

  const byName = Object.fromEntries(costs.map((c) => [c.name, c.id]))

  // Insert seed cost history
  const historyRows = costs.map((c) => [
    { cost_id: c.id, cost: c.previous_cost || c.cost, recorded_at: '2024-01-01' },
    { cost_id: c.id, cost: c.cost, recorded_at: '2024-04-01' },
  ]).flat()
  await supabase.from('cost_history').insert(historyRows)

  // Insert templates
  const { data: templates } = await supabase.from('templates').insert([
    { company_id: companyId, name: 'Basin Mixer', description: 'Standard basin mixer faucet template', raw_material_id: byName['Brass'] },
    { company_id: companyId, name: 'Wall Mixer', description: 'Wall-mounted mixer tap template', raw_material_id: byName['Brass'] },
    { company_id: companyId, name: 'Pillar Cock', description: 'Standard pillar cock template', raw_material_id: byName['Brass'] },
    { company_id: companyId, name: 'Angle Valve', description: 'Standard angle valve template', raw_material_id: byName['Brass'] },
  ]).select()

  if (!templates) return
  const tmplByName = Object.fromEntries(templates.map((t) => [t.name, t.id]))

  // Template components
  const components = [
    // Basin Mixer
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Cartridge 35mm'], qty: 1 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Aerator'], qty: 1 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Handle Premium'], qty: 1 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Flange'], qty: 2 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Check Nut'], qty: 2 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Chrome Plating'], qty: 1 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Packaging'], qty: 1 },
    { template_id: tmplByName['Basin Mixer'], cost_id: byName['Assembly Labour'], qty: 1 },
    // Wall Mixer
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Cartridge 35mm'], qty: 2 },
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Handle Premium'], qty: 2 },
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Flange'], qty: 2 },
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Check Nut'], qty: 4 },
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Chrome Plating'], qty: 1 },
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Packaging'], qty: 1 },
    { template_id: tmplByName['Wall Mixer'], cost_id: byName['Assembly Labour'], qty: 1 },
    // Pillar Cock
    { template_id: tmplByName['Pillar Cock'], cost_id: byName['Cartridge 35mm'], qty: 1 },
    { template_id: tmplByName['Pillar Cock'], cost_id: byName['Handle Standard'], qty: 1 },
    { template_id: tmplByName['Pillar Cock'], cost_id: byName['Check Nut'], qty: 1 },
    { template_id: tmplByName['Pillar Cock'], cost_id: byName['Chrome Plating'], qty: 1 },
    { template_id: tmplByName['Pillar Cock'], cost_id: byName['Packaging'], qty: 1 },
    // Angle Valve
    { template_id: tmplByName['Angle Valve'], cost_id: byName['Body Valve'], qty: 1 },
    { template_id: tmplByName['Angle Valve'], cost_id: byName['Check Nut'], qty: 2 },
    { template_id: tmplByName['Angle Valve'], cost_id: byName['Chrome Plating'], qty: 1 },
    { template_id: tmplByName['Angle Valve'], cost_id: byName['Packaging'], qty: 1 },
  ]
  await supabase.from('template_components').insert(components)

  // Insert products
  await supabase.from('products').insert([
    { company_id: companyId, template_id: tmplByName['Basin Mixer'], name: 'Premium Basin Mixer BM-100', sku: 'BM-100', category: 'Basin Mixer', brass_weight: 0.82, selling_price: 950 },
    { company_id: companyId, template_id: tmplByName['Basin Mixer'], name: 'Economy Basin Mixer BM-200', sku: 'BM-200', category: 'Basin Mixer', brass_weight: 0.75, selling_price: 780 },
    { company_id: companyId, template_id: tmplByName['Wall Mixer'], name: 'Wall Mixer WM-300', sku: 'WM-300', category: 'Wall Mixer', brass_weight: 1.20, selling_price: 1450 },
    { company_id: companyId, template_id: tmplByName['Pillar Cock'], name: 'Pillar Cock PC-400', sku: 'PC-400', category: 'Pillar Cock', brass_weight: 0.45, selling_price: 480 },
    { company_id: companyId, template_id: tmplByName['Pillar Cock'], name: 'Economy Pillar Cock PC-500', sku: 'PC-500', category: 'Pillar Cock', brass_weight: 0.38, selling_price: 350 },
    { company_id: companyId, template_id: tmplByName['Angle Valve'], name: 'Angle Valve AV-600', sku: 'AV-600', category: 'Angle Valve', brass_weight: 0.30, selling_price: 280 },
    { company_id: companyId, template_id: tmplByName['Angle Valve'], name: 'Premium Angle Valve AV-700', sku: 'AV-700', category: 'Angle Valve', brass_weight: 0.35, selling_price: 380 },
    { company_id: companyId, template_id: tmplByName['Wall Mixer'], name: 'Deluxe Wall Mixer WM-800', sku: 'WM-800', category: 'Wall Mixer', brass_weight: 1.45, selling_price: 1850 },
  ])

  // Insert alerts
  await supabase.from('alerts').insert([
    { company_id: companyId, type: 'margin_drop', severity: 'critical', title: 'Economy Pillar Cock PC-500 margin dropped below 15%', description: 'Current margin is 14.5%. Recommend increasing selling price by ₹30.' },
    { company_id: companyId, type: 'cost_increase', severity: 'warning', title: 'Brass price increased by 7.7%', description: 'Brass cost moved from ₹650 to ₹700/kg. Affects 8 products.' },
    { company_id: companyId, type: 'cost_increase', severity: 'warning', title: 'Cartridge 35mm price increased by 10.5%', description: 'Cartridge cost moved from ₹38 to ₹42. Affects 6 products.' },
    { company_id: companyId, type: 'margin_drop', severity: 'warning', title: 'Angle Valve AV-600 margin below threshold', description: 'Current margin 11.4% is below your 15% threshold.', is_read: true },
    { company_id: companyId, type: 'price_revision', severity: 'info', title: '3 products need price revision', description: 'Premium Basin Mixer, Economy Pillar Cock, and Angle Valve AV-600 require price updates.', is_read: true },
  ])
}
