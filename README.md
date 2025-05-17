# gigpanda
GigPanda, a clean, open-source marketplace that lets clients hire top freelancers as easily as a panda with a laptop.
<p align="center">
  <img src="assets/gigpanda_logo.svg" alt="GigPanda logo" width="180" />
</p>

# GigPanda 🐼💻

**GigPanda** is an open‑source Upwork‑style marketplace where businesses post projects and freelancers pitch with “connects.”

> **Tagline:** *Hire, hustle, and get paid—panda‑simple.*

---

## ✨ Core features

| Feature                                    | Status | Notes                                      |
| ------------------------------------------ | ------ | ------------------------------------------ |
| **Two roles**: Buyer (client) & Freelancer | ✅      | Switchable profile tabs                    |
| Job posting & proposal flow (Upwork style) | ✅      | Buyers allocate connects per listing       |
| Connect tokens economy                     | ✅      | Free monthly allotment + purchasable packs |
| Escrow payments (Stripe, crypto‑ready)     | ⏳      | Funds held until milestone approved        |
| Rating & review system                     | ✅      | Weighted toward recent jobs                |
| Real‑time chat & file share                | ⏳      | Socket.io + AWS S3                         |
| Notification center                        | ⏳      | Email + in‑app toasts                      |
| AI brief helper (optional)                 | ⏳      | GPT‑4o prompt templates                    |

---

## 🛠 Tech stack

| Layer       | Tech                                            |
| ----------- | ----------------------------------------------- |
| Front‑end   | **React 18**, **Tailwind CSS**, Vite            |
| State/query | **React Query** + Context API                   |
| Back‑end    | **Express 4**, **Node 18**, **CORS** middleware |
| Database    | **MongoDB** (Mongoose ODM)                      |
| Realtime    | **Socket.io**                                   |
| Auth        | **JWT** + optional OAuth2                       |
| Payments    | **Stripe** (crypto plug‑ins in roadmap)         |
| DevOps      | NPM scripts + GitHub Actions CI (no Docker)     |

---

## 🚀 Quick start (monorepo)

```bash
# 1‑‑Clone
$ git clone https://github.com/your‑org/gigpanda.git
$ cd gigpanda

# 2‑‑Install deps (root runs workspaces)
$ npm install

# 3‑‑Create env files
$ cp ./apps/server/.env.example ./apps/server/.env
$ cp ./apps/client/.env.example ./apps/client/.env
# – Add Mongo URI, JWT secret, Stripe keys, etc.

# 4‑‑Run in dev
# (nodemon back‑end, Vite front‑end)
$ npm run dev

# Front‑end → http://localhost:5173
# API        → http://localhost:4000
```

---

## 📈 Roadmap

* [ ] Stripe escrow release logic
* [ ] In‑app dispute resolution center
* [ ] Mobile PWA shell
* [ ] AI résumé analyser & gig match
* [ ] Webhooks & audit logs for enterprise clients

Track progress in the **Projects** tab.

---

## 🤝 Contributing

1. Fork & create a feature branch.
2. `npm run lint && npm test` must pass.
3. Open a PR describing **what** & **why**.
4. Grab a bamboo latte while we review. 🐼

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📜 License

MIT © 2025 GigPanda
