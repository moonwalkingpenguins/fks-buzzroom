# FKS BuzzRoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bangun platform kuis live on-premise (Kahoot-like) untuk pelatihan internal perusahaan dengan mode Standard, Tim vs Tim, Hot Seat, sistem kredit, dan reward catalog.

**Architecture:** Next.js 16 App Router sebagai full-stack framework, Socket.IO embedded untuk real-time, PostgreSQL + Prisma untuk persistence. State game aktif disimpan di memory (Map), data final ditulis ke DB saat sesi selesai.

**Tech Stack:** Next.js 16, Socket.IO, PostgreSQL 16, Prisma, NextAuth.js (credentials), Tailwind CSS v4, shadcn/ui, Docker Compose, TypeScript

**Spec:** `docs/specs/2026-03-23-fks-buzzroom-design.md`

---

## File Structure

```
fks-buzzroom/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx          # Login page
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                  # Admin layout + nav
│   │   │   ├── dashboard/page.tsx          # Dashboard satu halaman
│   │   │   ├── quizzes/page.tsx            # Daftar quiz
│   │   │   ├── quizzes/new/page.tsx        # Buat quiz baru / quick create
│   │   │   ├── quizzes/[id]/page.tsx       # Detail + edit quiz
│   │   │   ├── quizzes/[id]/preview/page.tsx # Preview mode
│   │   │   ├── users/page.tsx              # Manajemen karyawan
│   │   │   ├── rewards/page.tsx            # Catalog reward
│   │   │   └── rewards/claims/page.tsx     # Approve/reject klaim
│   │   ├── (host)/
│   │   │   ├── layout.tsx
│   │   │   ├── session/new/page.tsx        # Buat sesi baru
│   │   │   ├── session/[id]/lobby/page.tsx # Lobby + PIN display
│   │   │   ├── session/[id]/game/page.tsx  # Game control panel
│   │   │   └── session/[id]/podium/page.tsx
│   │   ├── (player)/
│   │   │   ├── layout.tsx
│   │   │   ├── join/page.tsx               # Join via PIN manual
│   │   │   ├── join/[pin]/page.tsx         # Join via link (PIN pre-filled)
│   │   │   ├── game/[sessionId]/page.tsx   # Game view peserta
│   │   │   ├── history/page.tsx            # Riwayat sesi
│   │   │   ├── history/[sessionId]/review/page.tsx # Replay soal salah
│   │   │   └── rewards/page.tsx            # Catalog + tukar kredit
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── socket/route.ts             # Socket.IO handler
│   │       ├── quizzes/route.ts
│   │       ├── quizzes/[id]/route.ts
│   │       ├── quizzes/[id]/questions/route.ts
│   │       ├── sessions/route.ts
│   │       ├── sessions/[id]/route.ts
│   │       ├── sessions/[id]/start/route.ts
│   │       ├── sessions/[id]/next/route.ts
│   │       ├── sessions/[id]/end/route.ts
│   │       ├── sessions/[id]/join/route.ts
│   │       ├── sessions/[id]/answer/route.ts
│   │       ├── sessions/[id]/vote/route.ts
│   │       ├── users/route.ts
│   │       ├── users/[id]/route.ts
│   │       ├── users/[id]/credits/route.ts
│   │       ├── rewards/route.ts
│   │       ├── rewards/[id]/route.ts
│   │       └── rewards/[id]/claim/route.ts
│   ├── components/
│   │   ├── ui/                             # shadcn/ui components
│   │   ├── host/
│   │   │   ├── LobbyPanel.tsx
│   │   │   ├── GameControl.tsx
│   │   │   ├── HostLeaderboard.tsx
│   │   │   └── PodiumDisplay.tsx
│   │   ├── player/
│   │   │   ├── JoinForm.tsx
│   │   │   ├── WaitingRoom.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerFeedback.tsx
│   │   │   ├── PlayerLeaderboard.tsx
│   │   │   └── ReviewCard.tsx
│   │   ├── admin/
│   │   │   ├── DashboardWidgets.tsx
│   │   │   ├── QuizForm.tsx
│   │   │   ├── QuestionEditor.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── RewardForm.tsx
│   │   │   ├── ClaimsTable.tsx
│   │   │   └── OnboardingChecklist.tsx
│   │   └── shared/
│   │       ├── OnboardingTooltip.tsx
│   │       ├── QRCodeDisplay.tsx
│   │       └── Timer.tsx
│   ├── lib/
│   │   ├── prisma.ts                       # Prisma client singleton
│   │   ├── auth.ts                         # NextAuth config
│   │   ├── socket-server.ts               # Socket.IO server instance
│   │   ├── game-state.ts                  # In-memory game state (Map)
│   │   ├── scoring.ts                     # Poin & streak logic
│   │   ├── credits.ts                     # Distribusi kredit
│   │   └── pin.ts                         # Generate PIN unik
│   ├── hooks/
│   │   ├── useSocket.ts                   # Socket.IO client hook
│   │   ├── useTimer.ts                    # Countdown timer hook
│   │   └── useOnboarding.ts              # Onboarding state hook
│   └── types/
│       └── index.ts                       # Shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                            # Super admin + template quiz
├── tests/
│   ├── unit/
│   │   ├── scoring.test.ts
│   │   ├── credits.test.ts
│   │   └── pin.test.ts
│   └── integration/
│       └── sessions.test.ts
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Phase 1 — Foundation

### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`
- Create: `tailwind.config.ts`, `src/app/globals.css`
- Create: `.env.example`

- [ ] **Step 1: Init Next.js project**

```bash
cd "E:/Project Test/fks-buzzroom"
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-git --yes
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install socket.io socket.io-client
npm install next-auth@beta @auth/prisma-adapter
npm install @prisma/client prisma
npm install bcryptjs
npm install @types/bcryptjs -D
npm install qrcode react-qr-code
npm install @types/qrcode -D
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init -y
npx shadcn@latest add button card input label badge table dialog sheet toast tabs
```

- [ ] **Step 4: Buat `.env.example`**

```env
DATABASE_URL="postgresql://buzzroom:password@localhost:5432/buzzroom"
NEXTAUTH_SECRET="ganti-dengan-random-string-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js + dependencies"
```

---

### Task 2: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Tulis schema Prisma**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { super_admin admin player }
enum SessionMode { standard team_vs_team hot_seat }
enum SessionStatus { created lobby in_progress between_questions finished aborted }
enum JoinMode { guest identified }
enum TransactionType { session_reward admin_bonus claim_reserve claim_deduct claim_release }
enum ClaimStatus { pending approved rejected }
enum QuestionType { multiple_choice true_false puzzle }

model User {
  id               String   @id @default(cuid())
  name             String
  employeeCode     String?  @unique
  email            String?  @unique
  passwordHash     String?
  role             Role     @default(player)
  creditsBalance   Int      @default(0)
  creditsReserved  Int      @default(0)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())

  hostedSessions   GameSession[]     @relation("HostedSessions")
  sessionPlayers   SessionPlayer[]
  creditTx         CreditTransaction[]
  rewardClaims     RewardClaim[]
  onboarding       UserOnboarding?
  adminActions     CreditTransaction[] @relation("AdminActions")
  adminClaims      RewardClaim[]       @relation("AdminClaims")
}

model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String?
  isTemplate  Boolean  @default(false)
  isArchived  Boolean  @default(false)
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])  // ← tambah ke User
  createdAt   DateTime @default(now())
  questions   Question[]
  sessions    GameSession[]
}

model Question {
  id          String       @id @default(cuid())
  quizId      String
  quiz        Quiz         @relation(fields: [quizId], references: [id])
  type        QuestionType @default(multiple_choice)
  content     String
  imageUrl    String?
  durationSecs Int         @default(20)
  orderIndex  Int
  explanation String?
  options     QuestionOption[]
  answers     Answer[]
}

model QuestionOption {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  content    String
  isCorrect  Boolean  @default(false)
  orderIndex Int
  answers    Answer[]
}

model GameSession {
  id                   String        @id @default(cuid())
  quizId               String
  quiz                 Quiz          @relation(fields: [quizId], references: [id])
  hostId               String
  host                 User          @relation("HostedSessions", fields: [hostId], references: [id])
  mode                 SessionMode   @default(standard)
  pin                  String        @unique
  status               SessionStatus @default(created)
  currentQuestionIndex Int           @default(0)
  startedAt            DateTime?
  endedAt              DateTime?
  createdAt            DateTime      @default(now())

  teams        SessionTeam[]
  players      SessionPlayer[]
  answers      Answer[]
  creditTx     CreditTransaction[]
}

model SessionTeam {
  id        String      @id @default(cuid())
  sessionId String
  session   GameSession @relation(fields: [sessionId], references: [id])
  name      String
  color     String
  members   SessionTeamMember[]
}

model SessionTeamMember {
  id     String      @id @default(cuid())
  teamId String
  team   SessionTeam @relation(fields: [teamId], references: [id])
  userId String
}

model SessionPlayer {
  id         String      @id @default(cuid())
  sessionId  String
  session    GameSession @relation(fields: [sessionId], references: [id])
  userId     String?
  user       User?       @relation(fields: [userId], references: [id])
  guestName  String?
  joinMode   JoinMode    @default(guest)
  teamId     String?
  totalScore Int         @default(0)
  streakCount Int        @default(0)
  finalRank  Int?
  joinedAt   DateTime    @default(now())
  answers    Answer[]
}

model Answer {
  id               String         @id @default(cuid())
  sessionId        String
  session          GameSession    @relation(fields: [sessionId], references: [id])
  questionId       String
  question         Question       @relation(fields: [questionId], references: [id])
  playerId         String
  player           SessionPlayer  @relation(fields: [playerId], references: [id])
  selectedOptionId String?
  selectedOption   QuestionOption? @relation(fields: [selectedOptionId], references: [id])
  isCorrect        Boolean        @default(false)
  score            Int            @default(0)
  timeTakenMs      Int            @default(0)
  answeredAt       DateTime       @default(now())
}

model CreditTransaction {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id])
  amount    Int
  type      TransactionType
  reason    String
  sessionId String?
  session   GameSession?    @relation(fields: [sessionId], references: [id])
  adminId   String?
  admin     User?           @relation("AdminActions", fields: [adminId], references: [id])
  claimId   String?
  createdAt DateTime        @default(now())
}

model Reward {
  id          String   @id @default(cuid())
  name        String
  description String?
  imageUrl    String?
  creditCost  Int
  stock       Int      @default(-1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  claims      RewardClaim[]
}

model RewardClaim {
  id           String      @id @default(cuid())
  userId       String
  user         User        @relation(fields: [userId], references: [id])
  rewardId     String
  reward       Reward      @relation(fields: [rewardId], references: [id])
  creditsSpent Int
  status       ClaimStatus @default(pending)
  adminId      String?
  admin        User?       @relation("AdminClaims", fields: [adminId], references: [id])
  adminNote    String?
  claimedAt    DateTime    @default(now())
  processedAt  DateTime?
}

model UserOnboarding {
  id               String  @id @default(cuid())
  userId           String  @unique
  user             User    @relation(fields: [userId], references: [id])
  stepPlayerDone   Boolean @default(false)
  stepQuizCreated  Boolean @default(false)
  stepPreviewDone  Boolean @default(false)
  stepSessionDone  Boolean @default(false)
}
```

- [ ] **Step 2: Buat Prisma client singleton**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Generate & migrate**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Expected: Migration sukses, tabel terbuat.

- [ ] **Step 4: Buat seed (super admin + template quiz)**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Super Admin
  const passwordHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { employeeCode: 'ADMIN-001' },
    update: {},
    create: {
      name: 'Super Admin',
      employeeCode: 'ADMIN-001',
      passwordHash,
      role: 'super_admin',
    },
  })

  // Template: K3 Dasar
  await prisma.quiz.upsert({
    where: { id: 'template-k3' },
    update: {},
    create: {
      id: 'template-k3',
      title: 'K3 Dasar — Keselamatan Kerja',
      category: 'Safety',
      isTemplate: true,
      createdById: (await prisma.user.findFirst({ where: { role: 'super_admin' } }))!.id,
      questions: {
        create: [
          {
            content: 'APD apa yang wajib dipakai saat bekerja di ketinggian?',
            type: 'multiple_choice',
            durationSecs: 20,
            orderIndex: 0,
            explanation: 'Full body harness melindungi seluruh tubuh saat jatuh dari ketinggian.',
            options: {
              create: [
                { content: 'Helm saja', isCorrect: false, orderIndex: 0 },
                { content: 'Full body harness', isCorrect: true, orderIndex: 1 },
                { content: 'Sepatu safety', isCorrect: false, orderIndex: 2 },
                { content: 'Sarung tangan', isCorrect: false, orderIndex: 3 },
              ]
            }
          },
          {
            content: 'APAR harus diperiksa secara berkala setiap...',
            type: 'multiple_choice',
            durationSecs: 20,
            orderIndex: 1,
            explanation: 'Pemeriksaan bulanan memastikan APAR selalu siap digunakan.',
            options: {
              create: [
                { content: '1 tahun sekali', isCorrect: false, orderIndex: 0 },
                { content: '6 bulan sekali', isCorrect: false, orderIndex: 1 },
                { content: '1 bulan sekali', isCorrect: true, orderIndex: 2 },
                { content: '2 tahun sekali', isCorrect: false, orderIndex: 3 },
              ]
            }
          },
        ]
      }
    },
  })

  console.log('Seed selesai ✅')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 5: Tambah seed script di package.json & jalankan**

```json
"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
```

```bash
npx prisma db seed
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: prisma schema + seed (super admin + K3 template)"
```

---

### Task 3: Auth (NextAuth credentials)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Config NextAuth**

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        employeeCode: { label: 'Kode Karyawan' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ employeeCode, password }) {
        const user = await prisma.user.findUnique({
          where: { employeeCode: String(employeeCode) },
        })
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(String(password), user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role as string
      return session
    },
  },
  pages: { signIn: '/login' },
})
```

- [ ] **Step 2: Route handler**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 3: Login page**

```typescript
// src/app/(auth)/login/page.tsx
'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await signIn('credentials', {
      employeeCode: code, password: pass, redirect: false
    })
    if (res?.error) setError('Kode atau password salah')
    else window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 bg-[#17171C] border border-[#2E2E33] rounded-2xl">
        <div className="text-center">
          <div className="text-[#FAD200] font-bold text-sm tracking-widest mb-2">⚡ FKS BUZZROOM</div>
          <h1 className="text-white text-2xl font-bold">Masuk</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Kode Karyawan (misal: FKS-0023)"
            value={code} onChange={e => setCode(e.target.value)}
            className="bg-[#1C1C22] border-[#2E2E33] text-white" />
          <Input type="password" placeholder="Password"
            value={pass} onChange={e => setPass(e.target.value)}
            className="bg-[#1C1C22] border-[#2E2E33] text-white" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818]">
            Masuk →
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test login manual**

Jalankan `npm run dev`, buka `localhost:3000/login`, login dengan `ADMIN-001` / `admin123`.
Expected: Redirect ke `/dashboard`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: auth login dengan NextAuth credentials"
```

---

## Phase 2 — Core Libraries

### Task 4: Game Logic Libraries

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `src/lib/pin.ts`
- Create: `src/lib/game-state.ts`
- Create: `src/types/index.ts`
- Create: `tests/unit/scoring.test.ts`
- Create: `tests/unit/pin.test.ts`

- [ ] **Step 1: Install test runner**

```bash
npm install -D vitest @vitest/coverage-v8
```

Tambah ke `package.json`:
```json
"scripts": { "test": "vitest run", "test:watch": "vitest" }
```

- [ ] **Step 2: Tulis test scoring (FAILING dulu)**

```typescript
// tests/unit/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { calculateScore, applyStreak } from '@/lib/scoring'

describe('calculateScore', () => {
  it('returns base * ratio, minimum 100', () => {
    expect(calculateScore(20, 20)).toBe(1000) // jawab langsung
    expect(calculateScore(0, 20)).toBe(100)   // mepet waktu = minimum
    expect(calculateScore(10, 20)).toBe(500)  // setengah waktu
  })
  it('returns 0 for wrong answer', () => {
    expect(calculateScore(null, 20)).toBe(0)
  })
})

describe('applyStreak', () => {
  it('adds 100 per streak', () => {
    expect(applyStreak(500, 3)).toBe(800)
  })
  it('no bonus for streak 0 or 1', () => {
    expect(applyStreak(500, 0)).toBe(500)
    expect(applyStreak(500, 1)).toBe(500)
  })
})
```

- [ ] **Step 3: Run test — verify FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/lib/scoring'`

- [ ] **Step 4: Implementasi scoring**

```typescript
// src/lib/scoring.ts
const BASE_POIN = 1000
const MIN_POIN = 100

export function calculateScore(timeRemainingMs: number | null, totalDurationMs: number): number {
  if (timeRemainingMs === null) return 0
  const ratio = Math.max(0.1, timeRemainingMs / totalDurationMs)
  return Math.round(BASE_POIN * ratio)
}

export function applyStreak(score: number, streak: number): number {
  if (streak < 2) return score
  return score + (streak - 1) * 100
}
```

- [ ] **Step 5: Run test — verify PASS**

```bash
npm test
```

Expected: PASS ✅

- [ ] **Step 6: Buat PIN generator**

```typescript
// src/lib/pin.ts
import { prisma } from './prisma'

export async function generateUniquePin(): Promise<string> {
  let pin: string
  let exists = true
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000))
    const session = await prisma.gameSession.findFirst({
      where: { pin, status: { in: ['created', 'lobby', 'in_progress', 'between_questions'] } }
    })
    exists = !!session
  } while (exists)
  return pin
}
```

- [ ] **Step 7: Buat game state (in-memory)**

```typescript
// src/lib/game-state.ts
export interface PlayerState {
  playerId: string
  displayName: string
  joinMode: 'guest' | 'identified'
  score: number
  streak: number
  answeredCurrentQuestion: boolean
}

export interface GameState {
  sessionId: string
  status: string
  currentQuestionIndex: number
  players: Map<string, PlayerState>
  questionStartedAt: number | null
  hotSeatPlayerId: string | null
  hotSeatVotes: Map<string, 'support' | 'challenge'>
}

const sessions = new Map<string, GameState>()

export function createGameState(sessionId: string): GameState {
  const state: GameState = {
    sessionId, status: 'lobby', currentQuestionIndex: 0,
    players: new Map(), questionStartedAt: null,
    hotSeatPlayerId: null, hotSeatVotes: new Map(),
  }
  sessions.set(sessionId, state)
  return state
}

export function getGameState(sessionId: string): GameState | undefined {
  return sessions.get(sessionId)
}

export function deleteGameState(sessionId: string): void {
  sessions.delete(sessionId)
}
```

- [ ] **Step 8: Shared types**

```typescript
// src/types/index.ts
export interface LeaderboardEntry {
  rank: number
  playerId: string
  displayName: string
  score: number
  joinMode: 'guest' | 'identified'
}

export interface QuestionWithOptions {
  id: string
  content: string
  imageUrl: string | null
  type: string
  durationSecs: number
  orderIndex: number
  options: { id: string; content: string; orderIndex: number }[]
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scoring, pin generator, in-memory game state"
```

---

### Task 5: Socket.IO Server

**Files:**
- Create: `src/lib/socket-server.ts`
- Create: `src/app/api/socket/route.ts`
- Create: `src/hooks/useSocket.ts`

- [ ] **Step 1: Socket.IO server setup**

```typescript
// src/lib/socket-server.ts
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

let io: SocketIOServer | null = null

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io
  io = new SocketIOServer(httpServer, {
    cors: { origin: process.env.NEXTAUTH_URL || 'http://localhost:3000' },
    path: '/api/socket',
  })
  return io
}
```

> Socket.IO di Next.js App Router memerlukan custom server. Buat `server.ts` di root:

```typescript
// server.ts
import { createServer } from 'http'
import next from 'next'
import { initSocket } from './src/lib/socket-server'
import { registerSocketHandlers } from './src/lib/socket-handlers'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res))
  const io = initSocket(httpServer)
  registerSocketHandlers(io)
  httpServer.listen(3000, () => console.log('> Ready on http://localhost:3000'))
})
```

Update `package.json`:
```json
"scripts": {
  "dev": "ts-node server.ts",
  "build": "next build",
  "start": "NODE_ENV=production ts-node server.ts"
}
```

- [ ] **Step 2: Buat `src/lib/socket-handlers.ts` (skeleton)**

```typescript
// src/lib/socket-handlers.ts
import { Server } from 'socket.io'
import { getGameState, createGameState } from './game-state'
import { prisma } from './prisma'

export function registerSocketHandlers(io: Server) {

  io.on('connection', (socket) => {

    // JOIN SESSION
    socket.on('join_session', async ({ pin, employeeCode, guestName }) => {
      const session = await prisma.gameSession.findFirst({
        where: { pin, status: { in: ['lobby', 'in_progress'] } },
        include: { quiz: { include: { questions: { include: { options: true } } } } }
      })
      if (!session) { socket.emit('error', { message: 'PIN tidak valid' }); return }

      let state = getGameState(session.id) ?? createGameState(session.id)

      // Determine join mode
      let displayName = guestName ?? 'Tamu'
      let joinMode: 'guest' | 'identified' = 'guest'
      let userId: string | null = null

      if (employeeCode) {
        const user = await prisma.user.findUnique({ where: { employeeCode } })
        if (user) {
          displayName = user.name
          joinMode = 'identified'
          userId = user.id
        }
      }

      // Upsert session player
      const player = await prisma.sessionPlayer.upsert({
        where: { id: socket.id }, // simplifikasi — gunakan socketId
        update: {},
        create: {
          id: socket.id,
          sessionId: session.id,
          userId,
          guestName: joinMode === 'guest' ? displayName : null,
          joinMode,
        }
      })

      state.players.set(socket.id, {
        playerId: player.id, displayName, joinMode, score: 0, streak: 0,
        answeredCurrentQuestion: false,
      })

      socket.join(session.id)
      io.to(session.id).emit('player_joined', {
        playerList: Array.from(state.players.values()).map(p => ({
          playerId: p.playerId, displayName: p.displayName, joinMode: p.joinMode
        }))
      })

      socket.emit('joined_ok', { sessionId: session.id, playerId: player.id })
    })

    socket.on('disconnect', () => {
      // Cleanup jika perlu
    })
  })
}
```

- [ ] **Step 3: Client hook**

```typescript
// src/hooks/useSocket.ts
'use client'
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  const ref = useRef<Socket | null>(null)

  useEffect(() => {
    if (!socket) {
      socket = io({ path: '/api/socket' })
    }
    ref.current = socket
    return () => {}
  }, [])

  return ref.current
}
```

- [ ] **Step 4: Test Socket.IO manual**

Jalankan `npm run dev`, buka browser console:
```js
const s = io(); s.on('connect', () => console.log('connected', s.id))
```
Expected: `connected <socket-id>`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Socket.IO server + join_session handler + client hook"
```

---

## Phase 3 — Admin Features

### Task 6: Quiz Management (Admin)

**Files:**
- Create: `src/app/api/quizzes/route.ts`
- Create: `src/app/api/quizzes/[id]/route.ts`
- Create: `src/app/api/quizzes/[id]/questions/route.ts`
- Create: `src/app/(admin)/quizzes/page.tsx`
- Create: `src/app/(admin)/quizzes/new/page.tsx`
- Create: `src/app/(admin)/quizzes/[id]/page.tsx`
- Create: `src/components/admin/QuizForm.tsx`
- Create: `src/components/admin/QuestionEditor.tsx`

- [ ] **Step 1: API — list & create quiz**

```typescript
// src/app/api/quizzes/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const quizzes = await prisma.quiz.findMany({
    where: { isArchived: false },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(quizzes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, description, category } = await req.json()
  const quiz = await prisma.quiz.create({
    data: { title, description, category, createdById: session.user.id }
  })
  return NextResponse.json(quiz, { status: 201 })
}
```

- [ ] **Step 2: API — get, update, delete quiz by id**

```typescript
// src/app/api/quizzes/[id]/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
    include: { questions: { include: { options: true }, orderBy: { orderIndex: 'asc' } } }
  })
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const quiz = await prisma.quiz.update({ where: { id: params.id }, data })
  return NextResponse.json(quiz)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.quiz.update({ where: { id: params.id }, data: { isArchived: true } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: API — questions CRUD**

```typescript
// src/app/api/quizzes/[id]/questions/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { content, type, durationSecs, explanation, options, orderIndex } = await req.json()
  const question = await prisma.question.create({
    data: {
      quizId: params.id, content, type, durationSecs, explanation, orderIndex,
      options: { create: options.map((o: any, i: number) => ({ ...o, orderIndex: i })) }
    },
    include: { options: true }
  })
  return NextResponse.json(question, { status: 201 })
}
```

- [ ] **Step 4: Admin quiz list page**

Buat `src/app/(admin)/quizzes/page.tsx` — tampilkan daftar quiz dengan card grid, tombol Buat Quiz, badge jumlah soal, tombol ▶ Mulai Sesi dan Edit.

- [ ] **Step 5: QuizForm + QuestionEditor component**

Buat form untuk quick create (4 field) dan full create. `QuestionEditor` untuk tambah/edit soal satu per satu dengan preview pilihan jawaban.

- [ ] **Step 6: Test manual**

Buat quiz baru via UI, tambah 2 soal. Cek di database: `npx prisma studio`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: admin quiz management CRUD"
```

---

### Task 7: User Management (Admin)

**Files:**
- Create: `src/app/api/users/route.ts`
- Create: `src/app/api/users/[id]/route.ts`
- Create: `src/app/api/users/[id]/credits/route.ts`
- Create: `src/app/(admin)/users/page.tsx`

- [ ] **Step 1: API users**

CRUD karyawan — list, create (generate password sementara), update, deactivate. Endpoint credits untuk bonus manual admin (wajib isi alasan, catat di `credit_transactions`).

- [ ] **Step 2: User table page**

Table dengan kolom: Nama, Kode, Role, Kredit, Status. Aksi: Edit, Reset Password, Bonus Kredit (dialog).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin user management + bonus kredit"
```

---

## Phase 4 — Game Engine

### Task 8: Session Creation & Lobby (Host)

**Files:**
- Create: `src/app/api/sessions/route.ts`
- Create: `src/app/(host)/session/new/page.tsx`
- Create: `src/app/(host)/session/[id]/lobby/page.tsx`
- Create: `src/components/host/LobbyPanel.tsx`

- [ ] **Step 1: API create session**

```typescript
// src/app/api/sessions/route.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniquePin } from '@/lib/pin'
import { createGameState } from '@/lib/game-state'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { quizId, mode, teams } = await req.json()
  const pin = await generateUniquePin()

  const gameSession = await prisma.gameSession.create({
    data: {
      quizId, hostId: session.user.id, mode, pin, status: 'lobby',
      ...(mode === 'team_vs_team' && teams ? {
        teams: { create: teams.map((t: any) => ({ name: t.name, color: t.color })) }
      } : {})
    },
    include: { teams: true }
  })

  createGameState(gameSession.id)
  return NextResponse.json(gameSession, { status: 201 })
}
```

- [ ] **Step 2: Lobby page (Host)**

Tampilkan PIN besar + QR code. List peserta yang join update via Socket.IO event `player_joined`. Tombol "Mulai Game" memanggil `POST /api/sessions/[id]/start`.

- [ ] **Step 3: LobbyPanel component**

Komponen reusable dengan PIN display, QR code (gunakan `react-qr-code`), player chips.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: session creation + host lobby dengan PIN dan QR code"
```

---

### Task 9: Player Join Flow

**Files:**
- Create: `src/app/(player)/join/page.tsx`
- Create: `src/app/(player)/join/[pin]/page.tsx`
- Create: `src/components/player/JoinForm.tsx`

- [ ] **Step 1: Join page dengan dual mode**

Form: input PIN + toggle Tamu/Karyawan. Tamu: input nama bebas. Karyawan: input kode karyawan (disimpan di localStorage 30 hari). Banner info benefit masing-masing mode.

- [ ] **Step 2: Join via link `/join/[pin]`**

PIN otomatis terisi dari URL, user tinggal pilih mode dan submit.

- [ ] **Step 3: Emit `join_session` via Socket.IO**

Setelah submit → emit → tunggu `joined_ok` → redirect ke `/game/[sessionId]`.

- [ ] **Step 4: Waiting room page**

```typescript
// src/app/(player)/game/[sessionId]/page.tsx
// State machine client: waiting → question → answer_result → leaderboard → ... → podium
```

Tampilkan nama peserta, animasi tunggu. Listen Socket.IO event `question_start`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: player join flow (dual mode: tamu + karyawan) + waiting room"
```

---

### Task 10: Game Flow — Standard Mode

**Files:**
- Create: `src/app/api/sessions/[id]/start/route.ts`
- Create: `src/app/api/sessions/[id]/next/route.ts`
- Create: `src/app/api/sessions/[id]/answer/route.ts`
- Create: `src/app/(host)/session/[id]/game/page.tsx`
- Create: `src/components/player/QuestionCard.tsx`
- Create: `src/components/player/AnswerFeedback.tsx`
- Create: `src/components/host/HostLeaderboard.tsx`
- Add to: `src/lib/socket-handlers.ts`

- [ ] **Step 1: API start session**

```typescript
// src/app/api/sessions/[id]/start/route.ts
// Update status → in_progress, emit question_start via Socket.IO
```

- [ ] **Step 2: Socket handler — submit_answer**

```typescript
// Tambah ke socket-handlers.ts
socket.on('submit_answer', async ({ sessionId, questionId, optionId, timeTakenMs }) => {
  const state = getGameState(sessionId)
  if (!state || state.status !== 'in_progress') return

  const player = state.players.get(socket.id)
  if (!player || player.answeredCurrentQuestion) return
  player.answeredCurrentQuestion = true

  // Check correct answer
  const option = await prisma.questionOption.findUnique({ where: { id: optionId } })
  const isCorrect = option?.isCorrect ?? false

  let score = 0
  if (isCorrect) {
    const question = await prisma.question.findUnique({ where: { id: questionId } })
    const elapsed = timeTakenMs
    const total = (question?.durationSecs ?? 20) * 1000
    const remaining = Math.max(0, total - elapsed)
    player.streak = isCorrect ? player.streak + 1 : 0
    score = applyStreak(calculateScore(remaining, total), player.streak)
    player.score += score
  } else {
    player.streak = 0
  }

  // Save to DB
  await prisma.answer.create({
    data: { sessionId, questionId, playerId: player.playerId,
      selectedOptionId: optionId, isCorrect, score, timeTakenMs }
  })

  // Update player score in DB
  await prisma.sessionPlayer.update({
    where: { id: player.playerId },
    data: { totalScore: player.score, streakCount: player.streak }
  })

  socket.emit('answer_result', { isCorrect, scoreGained: score, newTotal: player.score, streak: player.streak })

  // Check if all answered
  const allAnswered = Array.from(state.players.values()).every(p => p.answeredCurrentQuestion)
  const hostSocketId = `host-${sessionId}` // track host socket
  io.to(hostSocketId).emit('answer_count_update', {
    answered: Array.from(state.players.values()).filter(p => p.answeredCurrentQuestion).length,
    total: state.players.size
  })
  if (allAnswered) {
    // Auto-advance timer jika semua sudah menjawab
    broadcastLeaderboard(io, sessionId, state)
  }
})
```

- [ ] **Step 3: API next question / end session**

Endpoint untuk host: lanjut ke soal berikutnya (emit `question_start`) atau akhiri sesi (emit `game_end`, distribusi kredit).

- [ ] **Step 4: Credits distribution**

```typescript
// src/lib/credits.ts
import { prisma } from './prisma'
import { PlayerState } from './game-state'

const STANDARD_CREDITS = [100, 50, 30, 10, 10, 10]

export async function distributeSessionCredits(
  sessionId: string,
  rankedPlayers: PlayerState[]
) {
  for (let i = 0; i < rankedPlayers.length; i++) {
    const player = rankedPlayers[i]
    if (player.joinMode !== 'identified' || !player.playerId) continue
    const credits = STANDARD_CREDITS[i] ?? 0
    if (credits === 0) continue

    const sp = await prisma.sessionPlayer.findUnique({ where: { id: player.playerId } })
    if (!sp?.userId) continue

    await prisma.$transaction([
      prisma.user.update({ where: { id: sp.userId }, data: { creditsBalance: { increment: credits } } }),
      prisma.creditTransaction.create({
        data: { userId: sp.userId, amount: credits, type: 'session_reward',
          reason: `Posisi ${i + 1} di sesi game`, sessionId }
      }),
      prisma.sessionPlayer.update({ where: { id: player.playerId }, data: { finalRank: i + 1 } })
    ])
  }
}
```

- [ ] **Step 5: QuestionCard component (player)**

Tampilkan soal + 4 tombol pilihan berwarna + timer countdown visual. Disable setelah dijawab.

- [ ] **Step 6: HostLeaderboard component**

Ranking real-time setelah setiap soal. Animasi rank change. Tombol "Soal Berikutnya".

- [ ] **Step 7: Test sesi end-to-end**

Host buat sesi → peserta join (buka 2 tab browser) → host mulai → kedua peserta jawab → cek leaderboard → soal berikutnya → selesai → cek kredit di DB.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: game engine standard mode — scoring, leaderboard, credit distribution"
```

---

### Task 11: Mode Tim vs Tim

**Files:**
- Modify: `src/app/(host)/session/new/page.tsx` (tambah team setup)
- Modify: `src/lib/socket-handlers.ts`
- Modify: `src/lib/credits.ts`

- [ ] **Step 1: Team setup di session creation**

Jika mode `team_vs_team`: form tambah tim (nama + pilih warna), assign peserta ke tim saat join (host assign dari lobby atau peserta pilih saat join).

- [ ] **Step 2: Team score calculation**

Setelah setiap soal, hitung rata-rata skor per tim. Emit `leaderboard_update` dengan ranking per tim.

- [ ] **Step 3: Team credits distribution**

```typescript
// Tambah ke credits.ts
export async function distributeTeamCredits(sessionId: string, rankedTeams: { teamId: string, members: string[] }[]) {
  const TEAM_CREDITS = [80, 50, 30, 10]
  for (let i = 0; i < rankedTeams.length; i++) {
    const credits = TEAM_CREDITS[i] ?? 10
    for (const userId of rankedTeams[i].members) {
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { creditsBalance: { increment: credits } } }),
        prisma.creditTransaction.create({
          data: { userId, amount: credits, type: 'session_reward',
            reason: `Tim posisi ${i + 1} di sesi game`, sessionId }
        })
      ])
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: mode tim vs tim — team scoring + distribusi kredit tim"
```

---

### Task 12: Mode Hot Seat

**Files:**
- Modify: `src/lib/socket-handlers.ts` (hot_seat_vote handler)
- Create: `src/app/(host)/session/[id]/game/hot-seat.tsx`

- [ ] **Step 1: Hot Seat flow di socket handlers**

Host emit `start_hot_seat` dengan playerId → emit ke semua `hot_seat_started` (siapa di kursi panas). Soal muncul hanya untuk Hot Seat. Penonton bisa vote `dukung`/`tantang` sekali.

- [ ] **Step 2: Evaluasi & distribusi kredit Hot Seat**

Setelah semua soal Hot Seat selesai: hitung % benar. Jika ≥ 70% → Hot Seat menang. Distribusikan kredit sesuai spec.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: mode hot seat — voting, evaluasi, distribusi kredit"
```

---

## Phase 5 — Post-Game & Reward

### Task 13: Podium, Replay Soal Salah, Riwayat

**Files:**
- Create: `src/app/(host)/session/[id]/podium/page.tsx`
- Create: `src/app/(player)/history/page.tsx`
- Create: `src/app/(player)/history/[sessionId]/review/page.tsx`
- Create: `src/components/player/ReviewCard.tsx`

- [ ] **Step 1: Podium host**

Animasi top 3 dengan gold/silver/bronze. Tampilkan kredit yang didistribusikan.

- [ ] **Step 2: Player history page**

List sesi yang pernah diikuti. Tampilkan: judul quiz, tanggal, skor, posisi, kredit didapat.

- [ ] **Step 3: Replay soal salah**

Query: `answers WHERE playerId = X AND sessionId = Y AND isCorrect = false`. Tampilkan per soal: pertanyaan, jawaban peserta (merah), jawaban benar (hijau), penjelasan.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: podium, riwayat sesi, replay soal salah"
```

---

### Task 14: Reward Catalog & Klaim

**Files:**
- Create: `src/app/api/rewards/route.ts`
- Create: `src/app/api/rewards/[id]/claim/route.ts`
- Create: `src/app/(player)/rewards/page.tsx`
- Create: `src/app/(admin)/rewards/claims/page.tsx`

- [ ] **Step 1: API reward CRUD + klaim**

```typescript
// src/app/api/rewards/[id]/claim/route.ts
// 1. Cek saldo cukup (balance >= creditCost)
// 2. Cek stok > 0 atau unlimited (-1)
// 3. DB transaction: reserve kredit + create claim
// Row-level lock via SELECT FOR UPDATE (raw query Prisma)
```

- [ ] **Step 2: Reward catalog page (player)**

Grid hadiah dengan gambar, nama, harga kredit, stok. Tombol "Klaim" (disable jika stok 0 atau saldo tidak cukup). Tampilkan saldo kredit di header.

- [ ] **Step 3: Claims management (admin)**

Table klaim pending. Tombol Approve/Reject dengan dialog isi catatan. Approve: deduct kredit + kurangi stok. Reject: release reserved kredit.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: reward catalog + klaim dengan reserve/deduct/release"
```

---

## Phase 6 — UX & Dashboard

### Task 15: Onboarding & Template

**Files:**
- Create: `src/components/shared/OnboardingTooltip.tsx`
- Create: `src/components/admin/OnboardingChecklist.tsx`
- Create: `src/hooks/useOnboarding.ts`

- [ ] **Step 1: Player onboarding tooltip (3 langkah)**

Overlay tooltip ditampilkan sekali (cek `user_onboarding.stepPlayerDone`). Langkah 1: timer, Langkah 2: pilih cepat, Langkah 3: lihat skor. Tombol Skip dan Lanjut. Update DB saat selesai.

- [ ] **Step 2: Admin onboarding checklist**

Tampil di dashboard jika `stepQuizCreated + stepPreviewDone + stepSessionDone` belum semua true. Hilang otomatis setelah ketiga langkah selesai.

- [ ] **Step 3: Template quiz di admin**

Halaman template: tampilkan 5 template bawaan (dari seed). Tombol "Gunakan Template" → duplicate quiz ke akun admin. Template ditandai badge biru.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: onboarding 3 langkah + template quiz siap pakai"
```

---

### Task 16: Admin Dashboard Satu Halaman

**Files:**
- Create: `src/app/(admin)/dashboard/page.tsx`
- Create: `src/components/admin/DashboardWidgets.tsx`

- [ ] **Step 1: Dashboard widgets**

4 widget utama: Quiz Saya (count + link), Sesi Terakhir (nama + peserta + tanggal), Klaim Pending (count + link), Statistik Cepat (total peserta, total sesi, kredit beredar).

- [ ] **Step 2: Quick actions**

Tombol: `+ Buat Quiz`, `▶ Mulai Sesi` (dialog pilih quiz), `📋 Template`, `👥 Users`. Semua dari 1 halaman tanpa navigasi.

- [ ] **Step 3: List quiz terbaru**

3–5 quiz terbaru dengan tombol ▶ langsung mulai sesi.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: admin dashboard satu halaman"
```

---

## Phase 7 — Docker & Deployment

### Task 17: Docker Compose Setup

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `nginx.conf`

- [ ] **Step 1: Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Docker Compose**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: buzzroom
      POSTGRES_USER: buzzroom
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://buzzroom:${DB_PASSWORD}@db:5432/buzzroom
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    depends_on: [db]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: ["./nginx.conf:/etc/nginx/conf.d/default.conf"]
    depends_on: [app]
    restart: unless-stopped

volumes:
  pgdata:
```

- [ ] **Step 3: Test Docker build**

```bash
docker compose build
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

Buka `http://localhost` — expected: login page muncul.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: Docker Compose deployment setup"
git push origin main
```

---

## Execution Handoff

**Plan complete dan tersimpan di `docs/plans/2026-03-23-fks-buzzroom-plan.md`.**

**Dua opsi eksekusi:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review antar task, iterasi cepat

**2. Inline Execution** — eksekusi dalam sesi ini menggunakan executing-plans, batch dengan checkpoint

Mana yang dipilih?
