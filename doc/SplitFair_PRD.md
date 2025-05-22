# 📄 Product Requirements Document (PRD)  
**App Name:** SplitFair  
**Version:** v0.1 (Stage 0 – Public Web Version)

---

## 🧠 1. Overview

**SplitFair** is a web and mobile app that helps users fairly split bills among groups. It allows for itemized bill entry, person-by-item assignment, automatic tax/service/discount calculation, and shareable summaries. The app will evolve from a public prototype into a logged-in experience and eventually a premium mobile app.

---

## 📈 2. App Roadmap by Stage

### 🟢 Stage 0 – Public Web Prototype (No Login)
- Add people
- Add items (name, price)
- Assign people to each item
- Add discount (% or amount), tax %, and service charge %
- Calculate total and per-person share
- Choose currency manually
- Optional: Save split anonymously and share via link

### 🔐 Stage 1 – Authenticated Web App
- Supabase Auth (email login)
- Create/manage groups or trips
- Add friends (name/email)
- Add and assign bills to a group
- View/edit history of splits
- Invite others to view or edit

### 📱 Stage 2 – Mobile App + Premium
- All features from Stage 1
- Push notifications
- Offline mode (draft)
- OCR support (Make.com, local, ChatGPT)
  - Extract restaurant name, date, total, currency, items, tax, service, discount
- Premium paywall:
  - Unlimited OCR scans
  - Export to CSV/PDF
  - Multi-currency support
  - Custom themes

---

## ✨ 3. Stage 0: Feature Requirements

### 3.1. Landing Page (`/`)
- Hero copy: “Split bills fairly. Fast, free, no login.”
- CTA: Try It Now → `/quicksplit`
- CTA: Sign up for full features (inactive)

### 3.2. QuickSplit Page (`/quicksplit`)
- **Add People**: Name input, reorder/delete
- **Add Items**: Item name + price, edit/delete
- **Assign People**: Multi-select for each item, auto split
- **Add Tax, Service Charge, Discount**
  - Input tax %, service %, discount (as % or flat amount)
- **Currency Selector**
  - Dropdown or input field
- **Summary**
  - Subtotal, discount, tax, service, grand total
  - Final owed amount per person (rounded)
- **Optional: Save/Share**
  - Save to `anonymous_splits` in Supabase
  - Generate a shareable link `/split/:id`

---

## 📁 4. Folder Structure

```
splitfair/
├── public/
│   └── images/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── landing/
│   │   ├── quicksplit/
│   │   ├── auth/ (Stage 1)
│   │   └── app/ (Stage 1)
│   ├── styles/
│   └── utils/
│       ├── splitLogic.js
│       ├── supabaseClient.js
│       └── formatter.js
├── supabase/
│   └── schema.sql
├── mobile/ (Stage 2)
├── .env
├── tailwind.config.js
├── vite.config.js
├── README.md
└── PRD.md
```

---

## 🧮 5. Supabase Schema – Stage 0

### Table: `anonymous_splits`

| Column        | Type       | Description                      |
|---------------|------------|----------------------------------|
| id            | UUID       | Primary key                      |
| people        | JSONB      | `[{"name": "Alice"}]`            |
| items         | JSONB      | `[{"name": "Pizza", "price": 20, "assigned": ["Alice", "Bob"]}]` |
| tax_percent   | Float      | e.g., `7.0`                      |
| service_fee   | Float      | e.g., `10.0`                     |
| discount      | Float      | Can be flat or percent           |
| discount_type | Text       | "percent" or "amount"            |
| currency      | Text       | e.g., "SGD", "USD"               |
| created_at    | Timestamp  | Auto-generated                   |

---

## 🛠️ 6. Tech Stack & Conventions

| Area        | Tool              |
|-------------|-------------------|
| Frontend    | React             |
| Styling     | Tailwind CSS      | #fetch https://tailwindcss.com/docs/installation/using-vite
| Backend     | Supabase          |
| Hosting     | Netlify           |
| OCR         | Make.com / ChatGPT / Local |
| AI Dev      | GitHub Copilot    |

---

## 🧑‍💻 7. GitHub Copilot Prompts

```js
// Create a function to split items evenly among assigned people
// Input: items = [{ name, price, assigned: [Alice, Bob] }]
// Output: summary = { Alice: 10, Bob: 10 }
```

```js
// Initialize Supabase client from .env using anon key
```

```js
// Validate tax, service, and discount fields; default to 0
```

```js
// Save an anonymous split to Supabase and return a public link
```

---

## ✅ 8. Deliverables for Stage 0

- Landing page (`/`)
- Quick split experience (`/quicksplit`)
- Real-time tax, service, discount, and split logic
- Manual currency support
- Optional anonymous save + link generation
- React frontend with Tailwind styling
- Supabase backend integration

---

## 🧭 9. Notes for Stage 1 & 2

Keep naming, data, and logic extensible for:
- Authenticated users and group ownership (Stage 1)
- Mobile-first workflows (Stage 2)
- OCR structured data ingestion (Stage 2)
- Feature flags or paywall for freemium gating (Stage 2)
