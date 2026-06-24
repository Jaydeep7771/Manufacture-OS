-- ============================================================
-- FinanceOS — Supabase Schema
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────
-- COMPANIES (multi-tenant)
-- ──────────────────────────────────────────────
create table if not exists companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

-- ──────────────────────────────────────────────
-- PROFILES (linked to auth.users)
-- ──────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  company_id  uuid references companies(id),
  full_name   text,
  role        text default 'owner' check (role in ('owner','finance_manager','purchase_manager','production_manager')),
  avatar      text,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────
-- MASTER COSTS
-- ──────────────────────────────────────────────
create table if not exists master_costs (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade,
  name          text not null,
  category      text not null check (category in ('raw_material','component','service')),
  unit          text not null default 'pcs',
  cost          numeric(12,2) not null,
  previous_cost numeric(12,2),
  updated_at    timestamptz default now(),
  created_at    timestamptz default now(),
  is_deleted    boolean default false
);

-- ──────────────────────────────────────────────
-- COST HISTORY
-- ──────────────────────────────────────────────
create table if not exists cost_history (
  id          uuid primary key default gen_random_uuid(),
  cost_id     uuid references master_costs(id) on delete cascade,
  cost        numeric(12,2) not null,
  recorded_at date not null default current_date,
  created_at  timestamptz default now()
);

-- Auto-log history when cost changes
create or replace function log_cost_history()
returns trigger language plpgsql as $$
begin
  if old.cost is distinct from new.cost then
    insert into cost_history (cost_id, cost, recorded_at)
    values (new.id, new.cost, current_date);
  end if;
  return new;
end;
$$;

drop trigger if exists cost_history_trigger on master_costs;
create trigger cost_history_trigger
  after update on master_costs
  for each row execute procedure log_cost_history();

-- ──────────────────────────────────────────────
-- PRODUCT TEMPLATES
-- ──────────────────────────────────────────────
create table if not exists templates (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid references companies(id) on delete cascade,
  name            text not null,
  description     text,
  raw_material_id uuid references master_costs(id),
  status          text default 'active' check (status in ('active','archived')),
  created_at      timestamptz default now(),
  is_deleted      boolean default false
);

-- Template components (junction)
create table if not exists template_components (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade,
  cost_id     uuid references master_costs(id) on delete cascade,
  qty         numeric(10,3) not null default 1,
  type        text default 'fixed' check (type in ('fixed','weight'))
);

-- ──────────────────────────────────────────────
-- PRODUCTS
-- ──────────────────────────────────────────────
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade,
  template_id   uuid references templates(id),
  name          text not null,
  sku           text,
  category      text,
  brass_weight  numeric(8,3) default 0,
  selling_price numeric(12,2) not null,
  status        text default 'active' check (status in ('active','discontinued')),
  created_at    timestamptz default now(),
  is_deleted    boolean default false
);

-- ──────────────────────────────────────────────
-- ALERTS
-- ──────────────────────────────────────────────
create table if not exists alerts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  type        text not null check (type in ('margin_drop','cost_increase','price_revision')),
  severity    text not null check (severity in ('critical','warning','info')),
  title       text not null,
  description text,
  product_id  uuid references products(id),
  cost_id     uuid references master_costs(id),
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
alter table companies           enable row level security;
alter table profiles            enable row level security;
alter table master_costs        enable row level security;
alter table cost_history        enable row level security;
alter table templates           enable row level security;
alter table template_components enable row level security;
alter table products            enable row level security;
alter table alerts              enable row level security;

-- Helper: get current user's company_id
create or replace function my_company_id()
returns uuid language sql stable as $$
  select company_id from profiles where id = auth.uid()
$$;

-- Profiles: own row only
create policy "profiles_own" on profiles for all using (id = auth.uid());

-- Companies: member only
create policy "companies_member" on companies for all
  using (id = my_company_id());

-- Master costs
create policy "costs_company" on master_costs for all
  using (company_id = my_company_id());

-- Cost history
create policy "cost_history_company" on cost_history for all
  using (cost_id in (select id from master_costs where company_id = my_company_id()));

-- Templates
create policy "templates_company" on templates for all
  using (company_id = my_company_id());

-- Template components
create policy "template_components_company" on template_components for all
  using (template_id in (select id from templates where company_id = my_company_id()));

-- Products
create policy "products_company" on products for all
  using (company_id = my_company_id());

-- Alerts
create policy "alerts_company" on alerts for all
  using (company_id = my_company_id());

-- ──────────────────────────────────────────────
-- SIGNUP RPC
-- Creates a company and attaches the current user to it.
-- SECURITY DEFINER so it can insert the company + set profiles.company_id
-- before the user has a company (the RLS policies above would otherwise
-- block the very first company insert). Safe: it only ever touches the
-- caller's own profile via auth.uid().
-- ──────────────────────────────────────────────
create or replace function create_company_and_join(company_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into companies (name) values (company_name) returning id into new_id;
  update profiles set company_id = new_id, role = 'owner' where id = auth.uid();
  return new_id;
end;
$$;

grant execute on function create_company_and_join(text) to authenticated;

-- ──────────────────────────────────────────────
-- SEED DATA
-- Handled programmatically by the app right after signup
-- (AuthContext.seedDefaultData), which runs once the new company exists.
-- ──────────────────────────────────────────────
