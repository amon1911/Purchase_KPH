# KPH Sourcing Management Portal

ระบบจัดซื้อจัดจ้างสำหรับ Kasetphand Group พร้อม **Approval Flow 5 ขั้น**, Cloud Storage, เเละ Printing

---

## 🎯 ฟีเจอร์

✅ Login + Register (เก็บ PIN ที่ hash เเล้ว)
✅ Dashboard เเสดงสถิติเเละคำขอที่รอตัวเองอนุมัติ
✅ สร้างคำขอจัดซื้อ + อัพโหลดไฟล์เเนบ
✅ Approval Flow ตาม Role อัตโนมัติ (Supervisor → Project Analysis → Project Manager → Purchasing)
✅ อนุมัติ / ปฏิเสธ พร้อมความคิดเห็น
✅ ค้นหา / กรองคำขอ
✅ พิมพ์เอกสาร (Print PO)
✅ Cloud Storage (Supabase) - เก็บข้อมูลออนไลน์

---

## 🚀 วิธีติดตั้ง (Step-by-Step)

### Step 1: เตรียมเครื่อง

ต้องติดตั้งโปรเเกรมเหล่านี้ก่อน:

1. **Node.js** (เวอร์ชั่น 18+) → ดาวน์โหลดที่ https://nodejs.org
2. **Git** (ถ้ายังไม่มี) → https://git-scm.com

ตรวจสอบโดย:
```bash
node --version    # ควรเห็น v18.x.x ขึ้นไป
npm --version
```

### Step 2: สมัคร Supabase (ฟรี)

1. ไปที่ https://supabase.com → กด **Start your project**
2. Login ด้วย GitHub
3. กด **New Project**:
   - **Name**: `kph-sourcing`
   - **Database Password**: ตั้งให้เเข็งเเรง เก็บไว้ดีๆ
   - **Region**: เลือก Southeast Asia (Singapore)
4. รอ ~2 นาทีให้ project สร้างเสร็จ

### Step 3: รัน SQL Migration

1. ใน Supabase Dashboard → คลิก **SQL Editor** (icon ฟ้าๆ ด้านซ้าย)
2. กด **+ New query**
3. เปิดไฟล์ `supabase/migrations/001_initial_schema.sql` คัดลอกเนื้อหาทั้งหมด
4. วางลงใน SQL Editor → กด **Run** (มุมขวาล่าง)
5. ถ้าเห็น "Success. No rows returned" = สำเร็จ ✅

### Step 4: ดึง API Keys

1. ใน Supabase Dashboard → **Settings** (icon เฟือง) → **API**
2. คัดลอก 2 ค่า:
   - **Project URL** (เช่น `https://abcxyz.supabase.co`)
   - **anon public key** (ยาวๆ ขึ้นต้น `eyJ...`)

### Step 5: ติดตั้งโปรเจกต์

เปิด Terminal ในโฟลเดอร์โปรเจกต์:

```bash
# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ env
cp .env.example .env
```

จากนั้นเปิดไฟล์ `.env` เเก้ไขเป็น keys ของจริง:

```
VITE_SUPABASE_URL=https://abcxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ.....your-real-key
```

### Step 6: รันโปรเจกต์

```bash
npm run dev
```

เปิด browser: http://localhost:5173

🎉 **เสร็จเเล้ว!** สามารถ login ด้วยผู้ใช้ใดก็ได้จาก seed data
- ชื่อ: `Saksit Tinarat` (หรือคนอื่น)
- **PIN: 1234** (ทุกคนใช้ PIN เดียวกันตอนเเรก)

---

## 📦 Deploy ขึ้น Cloudflare Pages (ฟรี)

### Step 1: Push โค้ดขึ้น GitHub

```bash
git init
git add .
git commit -m "initial commit"

# สร้าง repo ใน GitHub ก่อน เเล้ว...
git remote add origin https://github.com/YOUR_USERNAME/kph-sourcing.git
git push -u origin main
```

### Step 2: เชื่อม Cloudflare Pages

1. ไปที่ https://dash.cloudflare.com → **Workers & Pages**
2. **Create** → **Pages** → **Connect to Git**
3. เลือก repo `kph-sourcing`
4. ตั้งค่า build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. กด **Environment variables** → เพิ่ม:
   - `VITE_SUPABASE_URL` = (URL ของคุณ)
   - `VITE_SUPABASE_ANON_KEY` = (key ของคุณ)
6. กด **Save and Deploy**

รอ ~2 นาที จะได้ URL เช่น `kph-sourcing.pages.dev`

🎉 **เสร็จ!** ทุกคนใช้งานได้ผ่านเน็ตเเล้ว

---

## 🗂️ โครงสร้างไฟล์

```
kph-sourcing/
├── src/
│   ├── components/
│   │   ├── LoginScreen.jsx       # หน้า Login + Register
│   │   └── Sidebar.jsx           # เมนูข้าง
│   ├── pages/
│   │   ├── Dashboard.jsx         # หน้าเเรกหลัง login
│   │   ├── CreateRequest.jsx     # สร้างคำขอจัดซื้อ
│   │   ├── RequestList.jsx       # รายการคำขอ + ค้นหา
│   │   ├── RequestDetail.jsx     # รายละเอียด + อนุมัติ/ปฏิเสธ
│   │   └── PrintView.jsx         # หน้าพิมพ์
│   ├── lib/
│   │   ├── supabase.js           # Supabase client
│   │   ├── crypto.js             # MD5 สำหรับ hash PIN
│   │   └── requests.js           # API calls ทั้งหมด
│   ├── hooks/
│   │   └── useAuth.js            # จัดการ login state
│   ├── config/
│   │   └── roles.js              # ROLES + APPROVAL_FLOW
│   ├── App.jsx                   # main app + routing
│   ├── main.jsx                  # entry point
│   └── index.css                 # global styles
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # SQL สร้าง DB
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔐 ความปลอดภัย (สำคัญ!)

ตอนนี้ระบบใช้ **MD5 hash** ซึ่งเหมาะกับ MVP/internal tool เท่านั้น

**สำหรับ Production จริง ควรอัพเกรด:**
1. ย้ายไปใช้ **Supabase Auth** (email/password) เเทน PIN
2. เปลี่ยน MD5 → **bcrypt/argon2**
3. เพิ่ม **rate limiting** ป้องกัน brute force
4. เปิด **2FA** สำหรับ role สำคัญ (Project Manager, Purchasing)
5. ตั้งค่า **Row Level Security** ตาม role ละเอียดขึ้น

---

## 🆙 Upgrade เป็น Supabase Pro (เมื่อพร้อม)

เมื่อระบบเริ่มใช้งานจริงจัง อัพเกรดง่ายๆ:

1. Supabase Dashboard → **Settings** → **Billing**
2. กด **Upgrade to Pro** ($25/เดือน ~฿900)
3. ได้ทันที:
   - DB 8GB (จาก 500MB)
   - Storage 100GB (จาก 1GB)
   - Daily backup
   - ไม่มี database pause

**ไม่ต้องเเก้โค้ดอะไรเลย** 🎉

---

## 📝 หมายเหตุสำคัญ

### Database จะ Pause ถ้าไม่ใช้ 7 วัน (Free tier)

ถ้าไม่มีคนใช้ระบบ 7 วัน → DB จะ pause
- เข้า Supabase Dashboard → กด **Restore** เพื่อปลุก
- หรืออัพเกรด Pro = ไม่มี pause

### Backup ข้อมูล (สำหรับ Free tier)

Free tier ไม่มี auto backup → เเนะนำ:
1. ทุกเดือน → Supabase → **Database** → **Backups** → **Download**
2. หรือใช้ `pg_dump` ผ่าน command line

---

## 🐛 Troubleshooting

**ปัญหา**: เปิดเเล้วเห็น "ไม่สามารถโหลดรายชื่อผู้ใช้ได้"
- เช็คว่า `.env` ใส่ค่าถูกต้อง
- เช็คว่ารัน SQL migration เเล้ว
- เช็ค browser console (กด F12)

**ปัญหา**: Login ไม่ผ่าน
- ตรวจ PIN: `1234` (default)
- เช็คว่า user มีในตาราง `users` ของ Supabase

**ปัญหา**: Upload ไฟล์ไม่ได้
- เช็คว่ามี bucket ชื่อ `attachments` ใน Supabase Storage
- เช็ค Storage policies

---

## 📞 Support

มีปัญหา? ลองทำตามนี้:
1. เช็ค browser console (F12 → Console)
2. เช็ค Supabase Dashboard → Logs
3. ดูใน `.env` ว่าใส่ keys ถูกต้อง

---

Built with ❤️ for Kasetphand Group
