# ⚡ FKS BuzzRoom

> Platform kuis live on-premise untuk pelatihan internal perusahaan
>
> **"Training yang seru. Belajar yang membekas."**

---

## Tentang Proyek

FKS BuzzRoom adalah platform kuis live berbasis web yang dirancang untuk pelatihan internal perusahaan. Dijalankan sepenuhnya on-premise — data karyawan tidak keluar dari server perusahaan.

### Diferensiasi vs Kahoot
- 🏢 **On-premise** — deploy di server sendiri, data tetap internal
- 🎯 **Dual join mode** — main sebagai Tamu (langsung main) atau Karyawan (dapat kredit & reward)
- 🏆 **Reward catalog** — kredit bisa ditukar hadiah nyata
- 👥 **Mode Tim vs Tim** — kompetisi antar divisi
- 🔥 **Hot Seat mode** — 1 vs semua, drama tinggi
- 📖 **Replay soal salah** — nilai edukasi setelah game selesai

### Fitur Utama
- Live quiz dengan leaderboard real-time
- 3 mode game: Standard, Tim vs Tim, Hot Seat
- Tipe soal: Pilihan Ganda, True/False, Puzzle
- Sistem kredit + reward catalog
- Template quiz siap pakai
- Quick create & preview mode
- Dashboard satu halaman
- Onboarding 3 langkah untuk admin & peserta

---

## Stack

- **Framework**: Next.js 16 (App Router)
- **Real-time**: Socket.IO
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS v4 + FKS Design System
- **Deploy**: Docker Compose (on-premise)

---

## Dokumentasi

Design spec lengkap ada di repo **Ideax** (workspace brainstorming FKS):
`docs/superpowers/specs/2026-03-23-fks-quizlive-design.md`

---

## Status

🚧 **Dalam tahap desain** — Spec selesai, implementasi akan segera dimulai.

---

*Bagian dari FKS (Firmansyah Knowledge Suite) — koleksi developer tools internal.*
