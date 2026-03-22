# FKS BuzzRoom — Design Specification

> Platform kuis live on-premise untuk pelatihan internal perusahaan
>
> Date: 2026-03-23
> Status: Draft (Updated)
> Author: AI-assisted design session
> Last Updated: 2026-03-23 — Tambahan UX: dual login mode, link join, onboarding, template, quick create, preview mode, dashboard satu halaman

---

## Table of Contents

1. [Product Definition](#1-product-definition)
2. [Feature Breakdown](#2-feature-breakdown)
3. [Game Modes](#3-game-modes)
4. [Reward & Credit System](#4-reward--credit-system)
5. [Ease of Use & Onboarding](#5-ease-of-use--onboarding)
6. [System Architecture](#6-system-architecture)
7. [Database Schema](#7-database-schema)
8. [UI/UX Flow](#8-uiux-flow)
9. [Real-Time Architecture](#9-real-time-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Roadmap & Future Features](#11-roadmap--future-features)
12. [Risks & Trade-offs](#12-risks--trade-offs)

---

## 1. Product Definition

### 1.1 Positioning

| Attribute | Value |
|-----------|-------|
| **Nama Produk** | FKS BuzzRoom |
| **Tagline** | "Training yang seru. Belajar yang membekas." |
| **Target Pengguna** | Perusahaan skala kecil–menengah, HR/Training Manager, karyawan |
| **Deployment** | On-premise (Docker, server lokal perusahaan) |
| **Skala Awal** | < 50 peserta per sesi |
| **Diferensiasi vs Kahoot** | Mode Tim vs Tim, Hot Seat, Replay soal salah, Reward catalog nyata |

### 1.2 Problem Statement

| Pain Point | Solusi |
|------------|--------|
| Training internal membosankan, tidak interaktif | Format kuis live yang kompetitif dan gamified |
| Kahoot berbayar mahal untuk korporat | Self-hosted, sekali deploy, tidak ada biaya langganan |
| Data karyawan tidak boleh keluar ke cloud | Seluruh data di server internal perusahaan |
| Reward hanya poin abstrak, tidak memotivasi | Reward catalog visual — karyawan tahu hadiah nyata yang bisa ditukar |
| Tidak ada nilai edukasi setelah kuis | Fitur replay soal salah dengan penjelasan jawaban |

### 1.3 User Roles

| Role | Akses |
|------|-------|
| **Super Admin** | Setup sistem, kelola admin, lihat semua data |
| **Admin / Host** | Buat quiz, kelola soal, jalankan sesi, kelola reward |
| **Peserta** | Join sesi via PIN, jawab soal, lihat skor, tukar kredit |

---

## 2. Feature Breakdown

### 2.1 Manajemen Quiz (Admin)

- Buat, edit, hapus quiz
- Judul quiz, deskripsi, tag/kategori
- Tipe soal per pertanyaan:
  - **Pilihan Ganda** — 4 opsi, 1 jawaban benar
  - **True/False** — 2 opsi benar/salah
  - **Puzzle / Urutan** — susun urutan yang benar
- Durasi timer per soal (5–60 detik), configurable per soal
- Gambar opsional per soal
- Penjelasan jawaban (ditampilkan saat replay, bukan saat game live)

### 2.2 Manajemen Pengguna (Admin)

- Tambah, edit, nonaktifkan akun karyawan
- Reset password
- Lihat riwayat sesi per karyawan
- *(Import bulk CSV — v1.1)*

### 2.3 Sesi Game (Host)

- Buat sesi baru dari quiz yang dipilih
- Pilih mode: Standard / Tim vs Tim / Hot Seat
- Tampilkan Game PIN di layar besar (6-digit, expire setelah sesi selesai)
- **Share link join** — 1 klik copy link atau tampilkan QR code untuk proyektor
- Monitor peserta yang join real-time (nama + mode: Tamu/Karyawan)
- Kontrol soal: host tekan tombol untuk lanjut ke soal berikutnya (tidak auto-advance)
- Lihat leaderboard real-time setelah setiap soal
- Export hasil sesi ke CSV *(PDF — v1.1)*

### 2.4 Pengalaman Peserta — Dual Join Mode

Peserta memiliki **dua cara join** yang ditampilkan saat masuk PIN. Mereka bebas memilih, dengan penjelasan benefit masing-masing ditampilkan jelas di layar:

#### Mode A — Tamu (Nickname Bebas)
- Masukkan PIN game → ketik nama bebas → langsung main
- **Nol friction, nol akun, langsung seru**
- Cocok untuk: sesi pertama kali, peserta yang belum punya kode karyawan, atau sekadar fun
- ⚠️ Tidak mendapat kredit/reward — sistem tidak mengenali identitas
- Tampilan banner kuning kecil: *"Main sebagai Tamu — kamu tidak akan mendapat kredit dari sesi ini"*

#### Mode B — Karyawan (Kode Karyawan)
- Masukkan PIN game → ketik kode karyawan (misal: `FKS-0023`) → langsung main
- **Tidak perlu password, tidak perlu buat akun**
- Identitas dikenali → kredit otomatis masuk setelah sesi
- Tampilan badge hijau: *"Kamu akan mendapat kredit jika masuk 6 besar"*
- Device diingat selama 30 hari (tidak perlu masukkan kode lagi di sesi berikutnya)

#### Pilihan di Layar Join
```
┌─────────────────────────────────────┐
│  Masukkan PIN Game: [______]        │
│                                     │
│  ○ Main sebagai Tamu                │
│    Ketik nama bebas, langsung main  │
│    (tidak dapat kredit/reward)       │
│                                     │
│  ● Main sebagai Karyawan            │
│    Ketik kode karyawanmu            │
│    ✓ Dapat kredit & reward          │
│                                     │
│         [Bergabung →]               │
└─────────────────────────────────────┘
```

#### Join via Link (Admin Opsi D)
- Admin bisa share link langsung: `quizlive.internal/join/847291`
- PIN otomatis terisi — peserta tinggal pilih mode dan langsung masuk
- Admin bisa tampilkan QR code di proyektor/layar — peserta scan → PIN otomatis
- Link berlaku selama sesi aktif, expire setelah sesi selesai

#### Setelah Join
- Tampilan soal full-screen di HP/laptop (mobile-first, thumb-zone friendly)
- Timer countdown visual per soal
- Feedback langsung setelah jawab (benar/salah + poin didapat)
- Lihat posisi di leaderboard setelah tiap soal
- Setelah sesi: akses "Review Soal Salah" dari riwayat sesi (Mode B saja)
- Mode B: lihat kredit didapat, tukar di reward catalog

### 2.5 Replay Soal Salah

- Tersedia di halaman "Riwayat Sesi" peserta, diakses secara mandiri kapan saja
- Menampilkan hanya soal yang dijawab salah oleh peserta tersebut
- Per soal menampilkan: pertanyaan + gambar, jawaban peserta (merah), jawaban benar (hijau), penjelasan
- Replay bersifat informatif — tidak mempengaruhi skor atau kredit

---

## 3. Game Modes

### 3.1 Mode Standard (Default)

```
Host buat sesi → tampil PIN → peserta join → host tekan Mulai
→ soal tampil serentak → semua jawab dalam timer
→ host tekan Lanjut → leaderboard tampil
→ host tekan Soal Berikutnya → ...
→ sesi selesai → podium → distribusi kredit otomatis
```

**Sistem Poin:**
- Poin per soal = `base_poin × max(0.1, sisa_waktu / total_waktu)`
- `base_poin` = 1.000 (fixed, tidak configurable di v1.0)
- Minimum poin jika menjawab benar = 100 (10% dari base) — tidak pernah 0 meski mepet waktu
- Jawaban salah atau tidak menjawab = 0 poin
- Bonus streak: +100 poin per jawaban benar berturut-turut (streak reset jika salah)

### 3.2 Mode Tim vs Tim

```
Host buat sesi → atur tim (2–6 tim, nama + warna) → assign peserta ke tim
→ flow game sama seperti Standard
→ leaderboard menampilkan SKOR TIM = rata-rata poin anggota tim
→ sesi selesai → distribusi kredit berdasarkan posisi TIM
```

**Distribusi Kredit Tim vs Tim:**

| Posisi Tim | Kredit per Anggota |
|:----------:|:-----------------:|
| Tim Juara 1 | 80 kredit |
| Tim Juara 2 | 50 kredit |
| Tim Juara 3 | 30 kredit |
| Tim lainnya | 10 kredit |

Seluruh anggota tim mendapat kredit yang sama sesuai posisi tim mereka.

### 3.3 Mode Hot Seat

```
Host pilih peserta Hot Seat (acak atau pilih manual)
→ soal tampil satu per satu, hanya Hot Seat yang menjawab (5–10 soal)
→ peserta lain menonton + sekali vote per sesi: "Dukung" atau "Tantang"
→ Hot Seat dinyatakan MENANG jika jawab benar ≥ 70% dari soal
→ distribusi kredit:
   - Menang: Hot Seat +200, penonton "Dukung" +20 masing-masing
   - Kalah: Hot Seat +0, penonton "Tantang" +30 masing-masing
→ sesi Hot Seat selesai (tidak ada ronde berikutnya dalam v1.0)
```

**Klarifikasi mekanik:**
- 70% dihitung dari jumlah soal Hot Seat (misal: 7 dari 10 soal benar = menang)
- Vote penonton bersifat sekali per sesi, tidak per soal
- Vote "Dukung"/"Tantang" tidak mempengaruhi skor Hot Seat, hanya menentukan siapa yang dapat kredit
- Setelah Hot Seat selesai, sesi langsung berakhir (tidak ada Hot Seat berikutnya di v1.0)

---

## 4. Reward & Credit System

### 4.1 Distribusi Kredit Otomatis — Mode Standard

| Posisi | Kredit |
|:------:|:------:|
| Juara 1 | 100 |
| Juara 2 | 50 |
| Juara 3 | 30 |
| Posisi 4–6 | 10 |
| Posisi 7+ | 0 |

### 4.2 Bonus Manual Admin

- Admin bisa tambah kredit ke karyawan mana pun
- Wajib isi alasan (dicatat di audit trail)
- Kredit langsung masuk, tidak perlu approval

### 4.3 Reward Catalog & Klaim

- Admin daftarkan hadiah: nama, deskripsi, gambar, harga kredit, stok
- Peserta lihat catalog dan tekan "Klaim"
- Saat klaim dibuat: **kredit di-reserve (dikunci)** — tidak bisa dipakai untuk klaim lain
- Admin approve → kredit dipotong permanen, stok berkurang 1
- Admin reject → kredit reserve dilepas kembali ke saldo peserta
- Stok 0 → tombol klaim disable otomatis
- Concurrent claim: menggunakan database transaction dengan row-level lock pada stok reward

### 4.4 Riwayat Kredit (Audit Trail)

Setiap perubahan kredit dicatat dengan tipe:

| Tipe | Keterangan |
|------|------------|
| `session_reward` | Kredit dari hasil sesi game |
| `admin_bonus` | Kredit manual dari admin |
| `claim_reserve` | Kredit dikunci saat klaim dibuat |
| `claim_deduct` | Kredit dipotong setelah klaim diapprove |
| `claim_release` | Kredit dikembalikan setelah klaim direject |

---

## 5. Ease of Use & Onboarding

Prinsip utama: **pengguna baru harus bisa main dalam < 60 detik, dan admin bisa buat kuis pertama dalam < 5 menit.**

### 5.1 Onboarding Peserta (3 Langkah)

Ditampilkan sekali saat pertama kali peserta berhasil join sesi, berupa overlay tooltip yang bisa di-skip:

```
Langkah 1 of 3                     Langkah 2 of 3                    Langkah 3 of 3
┌──────────────────┐               ┌──────────────────┐              ┌──────────────────┐
│   👆 INI TIMER   │               │  🎯 PILIH CEPAT  │              │  🏆 INI SKORMU   │
│                  │               │                  │              │                  │
│  Kamu punya 20   │               │  Makin cepat     │              │  Lihat posisimu  │
│  detik menjawab  │               │  jawab, makin    │              │  setelah setiap  │
│  tiap soal       │               │  banyak poin!    │              │  soal            │
│                  │               │                  │              │                  │
│ [Skip] [Lanjut→] │               │ [Skip] [Lanjut→] │              │    [Mengerti!]   │
└──────────────────┘               └──────────────────┘              └──────────────────┘
```

### 5.2 Onboarding Admin (3 Langkah)

Ditampilkan saat admin login pertama kali, berupa checklist di dashboard:

```
🎉 Selamat datang! Yuk mulai dalam 3 langkah:

☐  1. Buat quiz pertamamu  →  [Buat Quiz]    (atau pilih dari template)
☐  2. Coba preview quiz    →  [Preview]
☐  3. Mulai sesi live      →  [Mulai Sesi]

Checklist ini hilang setelah ketiga langkah selesai.
```

### 5.3 Template Quiz Siap Pakai

Admin tidak perlu mulai dari nol. Tersedia template bawaan yang bisa langsung dipakai atau diedit:

| Template | Jumlah Soal | Kategori |
|----------|:-----------:|----------|
| K3 Dasar — Keselamatan Kerja | 10 | Safety |
| Orientasi Karyawan Baru | 8 | HR |
| Pengetahuan Umum Perusahaan | 10 | General |
| True/False Challenge | 10 | Mixed |
| Ice Breaker — Seru-Seruan | 8 | Fun |

- Template ditandai dengan label "Template" dan badge biru
- Admin klik "Gunakan Template" → quiz ter-copy ke daftar quiz admin → bisa diedit
- Template asli tidak bisa diubah (read-only)

### 5.4 Quick Create Quiz

Untuk admin yang butuh quiz cepat tanpa banyak konfigurasi:

```
[+ Buat Quiz Cepat]

Judul quiz: [_________________________]
Berapa soal? [5] [10] [15] (pilih)
Tipe soal:   [● Pilihan Ganda] [○ Campuran]
Timer:       [20] detik per soal

[Buat & Tambah Soal →]
```

- Form minimal, 4 field saja
- Setelah submit langsung masuk ke halaman tambah soal satu per satu
- Setting lanjutan (gambar, penjelasan, timer per soal) bisa diisi belakangan

### 5.5 Preview Mode

Sebelum dipakai ke peserta, admin bisa coba quiz sendiri:

- Tombol "Preview" di halaman quiz
- Membuka sesi simulasi solo (hanya admin yang main)
- Semua fitur aktif: timer, feedback benar/salah, skor — tapi tidak ada kredit
- Berguna untuk cek soal typo, urutan soal, dan durasi timer
- Preview tidak tersimpan di riwayat sesi

### 5.6 Dashboard Satu Halaman

Dashboard admin menampilkan semua informasi penting dalam 1 layar tanpa scroll berlebihan:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ FKS BuzzRoom          [+ Buat Quiz]   [▶ Mulai Sesi]        │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Quiz Saya   │ Sesi Terakhir│ Klaim Reward │  Statistik Cepat  │
│  ─────────── │ ──────────── │ ──────────── │ ────────────────── │
│  8 quiz      │ K3 Batch 3   │  3 pending   │  47 peserta aktif  │
│  [Lihat →]   │ 7 peserta    │  [Review →]  │  284 sesi total    │
│              │ Kemarin      │              │  1.2rb kredit beredar│
├──────────────┴──────────────┴──────────────┴────────────────────┤
│  Quiz Terbaru          Aksi Cepat                               │
│  • K3 Dasar      [▶]  [+ Quiz Cepat]  [📋 Template]  [👥 Users] │
│  • SOP Gudang    [▶]                                            │
│  • Ice Breaker   [▶]                                            │
└─────────────────────────────────────────────────────────────────┘
```

- Semua aksi utama bisa dilakukan dari dashboard tanpa navigasi ke halaman lain
- "Mulai Sesi" langsung membuka dialog pilih quiz — tidak perlu masuk ke halaman quiz dulu

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────┐
│                 FKS BuzzRoom                     │
│                                                  │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │  Next.js 16* │    │   Socket.IO Server   │   │
│  │  (App Router)│◄──►│   (embedded in app)  │   │
│  │              │    │                      │   │
│  │  - Admin UI  │    │  Real-time events:   │   │
│  │  - Host UI   │    │  - player_joined     │   │
│  │  - Player UI │    │  - question_start    │   │
│  │  - API Routes│    │  - answer_submitted  │   │
│  └──────┬───────┘    │  - leaderboard_update│   │
│         │            │  - game_end          │   │
│         ▼            └──────────────────────┘   │
│  ┌──────────────┐                               │
│  │  PostgreSQL  │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

> *Next.js 16 mengacu pada versi yang digunakan dalam FKS Design System (Next.js 16+ App Router).

**Catatan penting:** Socket.IO menyimpan state sesi aktif di memory proses Node.js. Jika container restart saat game sedang berlangsung, sesi akan hilang. Ini adalah risiko v1.0 yang diterima (lihat §11). Migrasi ke state persistence (Redis) direncanakan di v1.1.

### 5.1 Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend + Backend | Next.js 16 (App Router) | Full-stack, satu codebase |
| Real-time | Socket.IO | Reliable WebSocket + fallback HTTP long-poll |
| Database | PostgreSQL | Relasional, stabil, free |
| Auth | NextAuth.js (credentials) | Simple, on-premise friendly |
| ORM | Prisma | Type-safe, mudah migrasi |
| Styling | Tailwind CSS v4 + FKS Design System | Konsisten dengan brand FKS |
| Container | Docker + Docker Compose | Mudah deploy on-premise |

---

## 7. Database Schema

```sql
-- Users
users (
  id, name, employee_code UNIQUE, email, password_hash,
  role ENUM('super_admin','admin','player'),
  credits_balance INT DEFAULT 0,   -- saldo aktif (tidak termasuk reserved)
  credits_reserved INT DEFAULT 0,  -- kredit yang sedang dikunci untuk klaim pending
  created_at, is_active BOOL
)

-- Quizzes
quizzes (id, title, description, category, created_by FK users, created_at, is_archived)

-- Questions
questions (
  id, quiz_id FK quizzes, type ENUM('multiple_choice','true_false','puzzle'),
  content TEXT, image_url, duration_secs INT,
  order_index INT, explanation TEXT
)

-- Question Options
question_options (id, question_id FK questions, content, is_correct BOOL, order_index INT)

-- Game Sessions
game_sessions (
  id, quiz_id FK quizzes, host_id FK users,
  mode ENUM('standard','team_vs_team','hot_seat'),
  pin CHAR(6) UNIQUE (active sessions only),
  status ENUM('created','lobby','in_progress','between_questions','finished','aborted'),
  current_question_index INT DEFAULT 0,
  started_at, ended_at
)

-- Session Teams (for Tim vs Tim)
session_teams (id, session_id FK game_sessions, name, color)
session_team_members (id, team_id FK session_teams, user_id FK users)

-- Session Players
session_players (
  id, session_id FK game_sessions,
  user_id FK users NULLABLE,         -- NULL jika join sebagai Tamu
  guest_name VARCHAR NULLABLE,       -- nama bebas jika join sebagai Tamu
  join_mode ENUM('guest','identified'),
  team_id FK session_teams NULLABLE,
  total_score INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  final_rank INT NULLABLE,
  joined_at
)

-- Answers
answers (
  id, session_id FK game_sessions, question_id FK questions,
  player_id FK session_players,
  selected_option_id FK question_options NULLABLE,  -- NULL jika tidak menjawab
  is_correct BOOL, score INT, time_taken_ms INT,
  answered_at
)

-- Credit Transactions (audit trail)
credit_transactions (
  id, user_id FK users, amount INT,  -- positif = masuk, negatif = keluar
  type ENUM('session_reward','admin_bonus','claim_reserve','claim_deduct','claim_release'),
  reason TEXT, session_id FK game_sessions NULLABLE,
  admin_id FK users NULLABLE, claim_id FK reward_claims NULLABLE,
  created_at
)

-- Reward Catalog
rewards (
  id, name, description, image_url,
  credit_cost INT, stock INT,  -- -1 = unlimited
  is_active BOOL, created_at
)

-- Quiz Templates (read-only, seeded by system)
quiz_templates (id, title, description, category, is_system BOOL DEFAULT true, created_at)
-- Soal template menggunakan tabel questions + question_options yang sama,
-- dengan quiz_id menunjuk ke quiz_templates.id dan flag is_template=true di quizzes

-- User Onboarding Progress
user_onboarding (
  id, user_id FK users,
  step_player_done BOOL DEFAULT false,  -- onboarding peserta selesai
  step_quiz_created BOOL DEFAULT false,  -- admin: quiz pertama dibuat
  step_preview_done BOOL DEFAULT false,  -- admin: preview pertama
  step_session_done BOOL DEFAULT false   -- admin: sesi pertama dijalankan
)

-- Reward Claims
reward_claims (
  id, user_id FK users, reward_id FK rewards,
  credits_spent INT,
  status ENUM('pending','approved','rejected'),
  claimed_at, processed_at, admin_note TEXT
)
```

---

## 8. UI/UX Flow

### 7.1 Alur Host

```
Login → Dashboard
  → [Buat Quiz] → Tambah Soal (per tipe) → Simpan
  → [Mulai Sesi] → Pilih Quiz → Pilih Mode → (Tim vs Tim: setup tim)
  → Generate PIN → Lobby (tunggu peserta join, lihat join real-time)
  → [Mulai Game] → Soal 1 tampil di semua device peserta
  → [Lanjut] → Leaderboard → [Soal Berikutnya] → ...
  → Soal terakhir → Podium pemenang → distribusi kredit otomatis
  → [Export CSV]
```

### 7.2 Alur Peserta

```
Login → Dashboard
  → [Join Sesi] → Masukkan PIN → Lobby (animasi tunggu)
  → Soal tampil → Pilih jawaban → Feedback (benar/salah + poin)
  → Leaderboard → tunggu soal berikutnya → ...
  → Podium akhir → lihat kredit didapat
  → [Review Soal Salah] → akses dari Riwayat Sesi kapan saja
  → [Tukar Kredit] → Catalog hadiah → Klaim → tunggu approval admin
```

### 7.3 Layar Utama

| Screen | Aktor | Deskripsi |
|--------|-------|-----------|
| Host Lobby | Host | PIN besar, daftar peserta join real-time |
| Host Question Control | Host | Soal aktif, jumlah sudah menjawab, tombol Lanjut |
| Host Leaderboard | Host | Ranking setelah tiap soal, tombol Soal Berikutnya |
| Host Podium | Host | Animasi top 3, kredit yang didistribusikan |
| Player Waiting | Peserta | Animasi tunggu, nama peserta |
| Player Question | Peserta | Soal + pilihan berwarna + timer visual |
| Player Answer Result | Peserta | Benar/Salah + poin didapat |
| Player Leaderboard | Peserta | Posisi saya + ranking keseluruhan |
| Player Podium | Peserta | Posisi akhir + kredit diterima |
| Player Review | Peserta | Replay soal salah + penjelasan |
| Reward Catalog | Peserta | Grid hadiah + saldo kredit + tombol klaim |
| Admin Reward Claims | Admin | Daftar klaim pending, approve/reject |

---

## 9. Real-Time Architecture

### 8.1 WebSocket Events

```
CLIENT → SERVER
  join_session(pin, user_id)
  submit_answer(session_id, question_id, option_id, time_taken_ms)
  hot_seat_vote(session_id, vote: 'support' | 'challenge')

SERVER → ALL PLAYERS in room
  player_joined({ player_list })
  question_start({ question, options, duration_secs, question_index, total_questions })
  question_end({ correct_option_id, leaderboard })
  game_end({ final_rankings, credits_awarded })

SERVER → INDIVIDUAL PLAYER
  answer_result({ is_correct, score_gained, new_total, streak })

SERVER → HOST only
  answer_count_update({ answered, total })
```

### 8.2 Session State Machine

```
CREATED → LOBBY → IN_PROGRESS → BETWEEN_QUESTIONS → IN_PROGRESS (soal berikutnya)
                                                   → FINISHED (soal terakhir)
       → ABORTED (host disconnect atau manual abort)
```

**Transisi state:**
- `LOBBY → IN_PROGRESS`: host tekan "Mulai Game"
- `IN_PROGRESS → BETWEEN_QUESTIONS`: semua peserta menjawab ATAU timer habis (otomatis)
- `BETWEEN_QUESTIONS → IN_PROGRESS`: host tekan "Soal Berikutnya" (tidak auto-advance)
- `IN_PROGRESS → FINISHED`: soal terakhir selesai
- `ANY → ABORTED`: host tekan "Akhiri Sesi" atau timeout 10 menit tanpa aktivitas

**Host disconnect:** Jika koneksi host terputus, sesi masuk `ABORTED` setelah 5 menit tanpa reconnect. Peserta menerima event `session_aborted`.

### 8.3 Session State di Memory

State game aktif (skor real-time, jawaban per soal) disimpan di memory proses. Data final (skor akhir, jawaban) ditulis ke PostgreSQL saat sesi selesai. Jika proses restart saat game berlangsung, sesi hilang — host perlu mulai ulang. Ini risiko yang diterima di v1.0.

---

## 10. Deployment Architecture

### 9.1 Docker Compose

```yaml
services:
  app:      # Next.js 16 + Socket.IO (port 3000)
  db:       # PostgreSQL 16 (port 5432, tidak expose ke luar)
  nginx:    # Reverse proxy (port 80/443, SSL opsional)
```

### 9.2 Persyaratan Server

| Komponen | Minimum |
|----------|---------|
| CPU | 2 core |
| RAM | 2 GB |
| Storage | 20 GB |
| OS | Linux (Ubuntu 22.04 LTS) |
| Docker | v24+ |

### 9.3 Cara Deploy

```bash
git clone <repo>
cp .env.example .env   # isi: DATABASE_URL, NEXTAUTH_SECRET, dll
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed  # buat Super Admin pertama
```

---

## 11. Roadmap & Future Features

### v1.0 (Initial Release) — Scope Saat Ini
- ✅ Mode Standard, Tim vs Tim, Hot Seat
- ✅ Tipe soal: pilihan ganda, true/false, puzzle/urutan
- ✅ Leaderboard real-time per sesi
- ✅ Replay soal salah (akses mandiri dari riwayat)
- ✅ Reward catalog + sistem kredit + klaim approval
- ✅ Export hasil sesi ke CSV
- ✅ Deploy via Docker Compose
- ✅ Dual join mode: Tamu (nickname bebas) vs Karyawan (kode karyawan)
- ✅ Join via link / QR code (PIN embedded)
- ✅ Onboarding 3 langkah untuk peserta & admin
- ✅ Template quiz siap pakai (5 template bawaan)
- ✅ Quick create quiz (form minimal 4 field)
- ✅ Preview mode (simulasi solo sebelum sesi live)
- ✅ Dashboard satu halaman (semua aksi dari 1 layar)

### v1.1 — Enhancement
- Import bulk karyawan via CSV
- Export hasil sesi ke PDF
- Socket.IO state persistence via Redis (handle app restart)
- Streak badge lintas sesi
- Notifikasi klaim reward via email internal

### v2.0 — AI & Advanced
- **Generate soal otomatis dari dokumen PDF/SOP** (AI)
- Analytics dashboard per divisi/training
- Blind mode untuk assessment formal
- Soal submission dari peserta (admin approve)
- Multi-departemen / multi-tenant

---

## 12. Risks & Trade-offs

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| WebSocket tidak stabil di jaringan korporat lama | Peserta terputus saat game | Socket.IO fallback ke HTTP long-polling otomatis |
| App container restart saat game berlangsung | Sesi hilang, harus mulai ulang | Diterima di v1.0; Redis persistence di v1.1 |
| PIN collision (6-digit aktif bersamaan) | Peserta join sesi salah | PIN hanya unique di antara sesi aktif; max sesi aktif bersamaan < 10 untuk skala ini — risiko sangat rendah |
| Concurrent claim reward stok terbatas | Stok negatif / oversell | Row-level lock + database transaction saat deduct stok |
| Data karyawan (PII) on-premise | Tanggung jawab keamanan di IT perusahaan | Gunakan HTTPS, password di-hash (bcrypt), tidak ada data yang keluar ke luar jaringan |
| Multi-admin mulai sesi bersamaan | Konflik PIN atau sesi ganda | PIN di-generate unik per sesi, tidak ada batasan jumlah sesi aktif bersamaan |
| Peserta pakai HP berbeda (ukuran layar variatif) | UI rusak di HP kecil | Responsive design mobile-first, test di viewport 360px |
