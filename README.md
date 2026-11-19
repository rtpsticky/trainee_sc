# trainee_sc

ระบบฝึกประสบการณ์วิชาชีพ สาขาวิชาสาธารณสุขศาสตร์ แยกเป็น 2 ส่วนใน repo เดียว

| โฟลเดอร์ | เทคโนโลยี | Deploy ที่ | URL |
|---|---|---|---|
| `backend/` | Next.js (API route handlers เท่านั้น) + Prisma + PostgreSQL | Ubuntu server (PM2 + nginx) | `https://epid-odpc2.ddc.moph.go.th/trainee_sc` (API อยู่ใต้ `/trainee_sc/api`) |
| `frontend/` | Vite + React + React Router (SPA) | Cloudflare Workers (static assets) | `https://trainee-sc.<subdomain>.workers.dev` หรือโดเมนที่ผูกไว้ |

การยืนยันตัวตนใช้ JWT แบบ Bearer token: `POST /api/auth/login` คืน `token` แล้ว frontend เก็บใน `localStorage`
และส่งกลับมาใน header `Authorization: Bearer <token>` ทุกครั้ง

## พัฒนาในเครื่อง

```bash
# backend -> http://localhost:3001/trainee_sc/api
cd backend
cp .env.example .env     # ใส่ DATABASE_URL, SESSION_SECRET, CORS_ORIGINS
npm install              # รัน prisma generate ให้อัตโนมัติ
npm run db:migrate
npm run dev

# frontend -> http://localhost:5173 (อ่าน API จาก frontend/.env.development)
cd frontend
npm install
npm run dev
```

ผู้ใช้ตัวอย่างจาก `npm run db:seed`: `staff01` / `password123`

## Deploy backend (Ubuntu)

```bash
git clone <repo> && cd trainee_sc/backend
cp .env.example .env     # ตั้ง DATABASE_URL, SESSION_SECRET (สุ่มยาว ๆ), CORS_ORIGINS=<URL ของ frontend>
npm ci
npm run db:migrate
npm run build
pm2 start ecosystem.config.cjs && pm2 save
```

จากนั้นเพิ่ม `backend/deploy/nginx-trainee_sc.conf` ลงใน `server {}` ของ `epid-odpc2.ddc.moph.go.th` แล้ว `sudo nginx -t && sudo systemctl reload nginx`
ตรวจสอบด้วย `curl https://epid-odpc2.ddc.moph.go.th/trainee_sc/api/health`

อัปเดตเวอร์ชัน: `git pull && npm ci && npm run db:migrate && npm run build && pm2 restart trainee_sc-api`

## Deploy frontend (Cloudflare Workers)

```bash
cd frontend
npx wrangler login       # ครั้งแรกครั้งเดียว
npm run deploy           # vite build (ใช้ .env.production) + wrangler deploy
```

หรือเชื่อม repo กับ Cloudflare Workers Builds: root directory = `frontend`, build command = `npm run build`, deploy command = `npx wrangler deploy`

URL ของ API ถูกฝังตอน build จาก `VITE_API_URL` ใน `frontend/.env.production`
อย่าลืมเพิ่ม URL ของ frontend ลงใน `CORS_ORIGINS` ของ backend ด้วย ไม่อย่างนั้นเบราว์เซอร์จะเรียก API ไม่ได้

## API

ทุก path อยู่ใต้ `/trainee_sc/api` ตอบกลับเป็น JSON ถ้าผิดพลาดจะได้ `{ "error": "..." }` พร้อมสถานะ 4xx/5xx

| Method | Path | สิทธิ์ |
|---|---|---|
| GET | `/health` | สาธารณะ |
| POST | `/auth/login`, `/auth/register` | สาธารณะ |
| GET | `/auth/me`, `/dashboard` | ผู้ใช้ที่ล็อกอิน |
| GET / PUT | `/settings` | GET สาธารณะ, PUT = STAFF/ADMIN |
| GET | `/reports`, `/students` | TEACHER/STAFF/ADMIN |
| GET / POST | `/supervisions` · PUT / DELETE `/supervisions/:id` | TEACHER/STAFF/ADMIN |
| GET / POST | `/users` (`?role=&status=`) · PUT / DELETE `/users/:id` · POST `/users/:id/approve`, `/users/:id/reject` | STAFF/ADMIN |
| GET / POST | `/groups` · PUT / DELETE `/groups/:id` | STAFF/ADMIN |
| POST | `/groups/:id/students` (`{ studentIds }`) · DELETE `/groups/:id/students/:studentId` | STAFF/ADMIN |
| POST | `/groups/:id/mentors` · PUT / DELETE `/mentors/:id` | STAFF/ADMIN |
| GET / POST | `/locations` · PUT / DELETE `/locations/:id` | STAFF/ADMIN |

## หมายเหตุ (Windows)

backend ใช้ `next dev/build --webpack` เพราะ Turbopack ต้องสร้าง symlink ซึ่ง Windows ไม่อนุญาตถ้าไม่ได้เปิด Developer Mode
