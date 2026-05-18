-- ============================================================
-- KPH SOURCING - INITIAL DATABASE SCHEMA
-- ============================================================
-- วิธีใช้: เข้า Supabase Dashboard → SQL Editor → New Query
-- → วางโค้ดทั้งหมดนี้ → กด RUN
-- ============================================================

-- ลบตารางเก่าก่อน (ถ้ามี) - ระวัง! ใช้เฉพาะตอน setup ครั้งเเรก
drop table if exists public.approvals cascade;
drop table if exists public.attachments cascade;
drop table if exists public.request_items cascade;
drop table if exists public.purchase_requests cascade;
drop table if exists public.users cascade;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in (
    'Engineer Onsite (Philippines)',
    'Supervisor',
    'Project Analysis',
    'Project Manager',
    'Purchasing'
  )),
  pin_hash text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_users_role on public.users(role);

-- ============================================================
-- 2. PURCHASE REQUESTS (คำขอจัดซื้อหลัก)
-- ============================================================
create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  doc_number text unique not null,
  title text not null,
  project_name text,
  project_location text,
  description text,
  total_amount numeric(15, 2) default 0,
  currency text default 'THB',

  -- สถานะ
  status text not null default 'pending' check (status in (
    'pending', 'approved', 'rejected', 'cancelled'
  )),

  -- คนสร้าง
  created_by uuid not null references public.users(id),

  -- คิวอนุมัติปัจจุบัน (role ที่ต้องอนุมัติคิวต่อไป)
  current_approver_role text check (current_approver_role in (
    'Engineer Onsite (Philippines)',
    'Supervisor',
    'Project Analysis',
    'Project Manager',
    'Purchasing'
  )),
  current_step int default 1,

  -- วันที่
  required_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

create index idx_pr_status on public.purchase_requests(status);
create index idx_pr_creator on public.purchase_requests(created_by);
create index idx_pr_approver on public.purchase_requests(current_approver_role);
create index idx_pr_doc_number on public.purchase_requests(doc_number);

-- ============================================================
-- 3. REQUEST ITEMS (รายการสินค้าในคำขอ)
-- ============================================================
create table public.request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.purchase_requests(id) on delete cascade,
  item_name text not null,
  description text,
  quantity numeric(10, 2) not null default 1,
  unit text default 'pcs',
  unit_price numeric(15, 2) default 0,
  total_price numeric(15, 2) generated always as (quantity * unit_price) stored,
  remarks text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_items_request on public.request_items(request_id);

-- ============================================================
-- 4. APPROVALS (ประวัติการอนุมัติ)
-- ============================================================
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.purchase_requests(id) on delete cascade,
  approver_id uuid not null references public.users(id),
  approver_role text not null,
  step int not null,

  action text not null check (action in ('approved', 'rejected', 'returned')),
  comment text,

  created_at timestamptz default now()
);

create index idx_approvals_request on public.approvals(request_id);
create index idx_approvals_approver on public.approvals(approver_id);

-- ============================================================
-- 5. ATTACHMENTS (ไฟล์เเนบ)
-- ============================================================
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.purchase_requests(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  file_type text,
  uploaded_by uuid references public.users(id),
  created_at timestamptz default now()
);

create index idx_attachments_request on public.attachments(request_id);

-- ============================================================
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger pr_updated_at
  before update on public.purchase_requests
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 7. AUTO-GENERATE DOC NUMBER
-- ============================================================
-- รูปเเบบ: PR-YYYYMM-NNNN เช่น PR-202605-0001
create or replace function public.generate_doc_number()
returns trigger as $$
declare
  yymm text;
  next_num int;
  new_num text;
begin
  yymm := to_char(now(), 'YYYYMM');

  select coalesce(max(cast(substring(doc_number from 11) as int)), 0) + 1
  into next_num
  from public.purchase_requests
  where doc_number like 'PR-' || yymm || '-%';

  new_num := 'PR-' || yymm || '-' || lpad(next_num::text, 4, '0');
  new.doc_number := new_num;
  return new;
end;
$$ language plpgsql;

create trigger pr_generate_doc_number
  before insert on public.purchase_requests
  for each row
  when (new.doc_number is null or new.doc_number = '')
  execute function public.generate_doc_number();

-- ============================================================
-- 8. UPDATE TOTAL AMOUNT AUTOMATICALLY
-- ============================================================
create or replace function public.update_pr_total()
returns trigger as $$
begin
  update public.purchase_requests
  set total_amount = (
    select coalesce(sum(total_price), 0)
    from public.request_items
    where request_id = coalesce(new.request_id, old.request_id)
  )
  where id = coalesce(new.request_id, old.request_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger items_update_total
  after insert or update or delete on public.request_items
  for each row execute function public.update_pr_total();

-- ============================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.users enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.request_items enable row level security;
alter table public.approvals enable row level security;
alter table public.attachments enable row level security;

-- Policies: ตอนนี้เปิดให้อ่าน-เขียนได้ทั้งหมด (เหมาะกับ MVP)
-- ในอนาคตค่อยเพิ่ม policy ตาม role ที่ละเอียดขึ้น
create policy "Allow all on users" on public.users for all using (true) with check (true);
create policy "Allow all on purchase_requests" on public.purchase_requests for all using (true) with check (true);
create policy "Allow all on request_items" on public.request_items for all using (true) with check (true);
create policy "Allow all on approvals" on public.approvals for all using (true) with check (true);
create policy "Allow all on attachments" on public.attachments for all using (true) with check (true);

-- ============================================================
-- 10. STORAGE BUCKET FOR ATTACHMENTS
-- ============================================================
-- รัน SQL นี้ใน Storage section หรือใช้ Dashboard สร้าง bucket ชื่อ 'attachments'
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "Allow public access to attachments"
  on storage.objects for all
  using (bucket_id = 'attachments')
  with check (bucket_id = 'attachments');

-- ============================================================
-- 11. SEED INITIAL USERS (ผู้ใช้เริ่มต้น 8 คน)
-- ============================================================
-- PIN เริ่มต้น: 1234 (hash ด้วย bcrypt-like simple hash สำหรับ demo)
-- ใน production ควรใช้ Supabase Auth จริงๆ
-- ตอนนี้ใช้ MD5 (ไม่ใช่ของจริง) เพื่อความง่าย - app จะ hash เองตอน insert

insert into public.users (name, role, pin_hash) values
  ('Saksit Tinarat', 'Engineer Onsite (Philippines)', md5('1234')),
  ('Anuchit Kasem', 'Supervisor', md5('1234')),
  ('PATTANA ITTISANTISUK', 'Project Analysis', md5('1234')),
  ('CHIRASAK CHANACHIT', 'Project Manager', md5('1234')),
  ('Natnarong Chalermchat', 'Purchasing', md5('1234')),
  ('Rattasart Wandee', 'Supervisor', md5('1234')),
  ('NAKARIN BUPHOO', 'Supervisor', md5('1234')),
  ('Pattarapon Phothai', 'Supervisor', md5('1234'));

-- ============================================================
-- เสร็จสมบูรณ์! ตอนนี้พร้อมใช้งานเเล้ว
-- ============================================================
