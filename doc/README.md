# 🧾 SplitFair

SplitFair is a web and mobile app that helps users **fairly split bills** by assigning individual items, calculating tax, service charge, and discounts — and generating a clear summary per person.

## 🌐 Live Stages

| Stage | Status | Description |
|-------|--------|-------------|
| Stage 0 | 🚧 In Progress | Public web version — no login required |
| Stage 1 | 🔜 Planned | Authenticated app with group management |
| Stage 2 | 🔜 Planned | Mobile app with premium features |

---

## ⚙️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Supabase (DB + Auth)
- **Hosting**: Netlify
- **OCR**: Make.com or local or ChatGPT
- **Dev Tools**: GitHub + GitHub Copilot

---

## 📁 Folder Structure

```
splitfair/
├── public/
├── src/
│   ├── pages/
│   │   ├── landing/
│   │   └── quicksplit/
│   ├── components/
│   ├── utils/
│   └── styles/
├── supabase/
│   └── schema.sql
├── README.md
└── PRD.md
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/splitfair.git
cd splitfair
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run dev server
```bash
npm run dev
```

---

## 🧠 Reference Docs

- [PRD.md](./PRD.md) — Full product spec
- Supabase Schema — see `supabase/schema.sql`

---

## 📌 Todo (Stage 0)

- [ ] Landing page
- [ ] QuickSplit interface
- [ ] Tax, service charge, and discount calculation
- [ ] Optional anonymous save via Supabase

---

## 🧑‍💻 Author

Built by [Your Name]  
Inspired by real-world bill splitting pain ✨
