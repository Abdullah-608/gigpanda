# GigPanda 🐼💻

A clean, open-source freelancing marketplace that makes hiring and working with freelancers as easy as a panda with a laptop.

![GigPanda Banner](https://via.placeholder.com/1200x300/4CAF50/FFFFFF?text=GigPanda)

## 🚀 What is GigPanda?

GigPanda is an Upwork-style platform where:

* **Buyers** post projects, set milestones, and define budgets
* **Freelancers** spend *connects* to submit tailored proposals
* Both parties collaborate in a secure, feature-rich environment

## ✨ Core Features

* **Dual Role System**: Two dedicated roles (buyer & freelancer) with switchable dashboards
* **Proposal Economy**: Connect-based proposal system with free monthly allowance plus optional top-up packs
* **Secure Payments**: Escrow payments, milestone approvals, and dispute resolution
* **Trust & Reputation**: Ratings, reviews, and verified work history
* **Communication Tools**: Real-time chat, file sharing, and notifications

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| **Frontend**    | React 18, Tailwind CSS, Vite, Framer Motion |
| **Backend**     | Node 18, Express 4, CORS              |
| **Database**    | MongoDB with Mongoose                 |
| **Realtime**    | Socket.io                             |
| **Auth**        | JSON Web Tokens (JWT) + optional OAuth2 |
| **Payments**    | Stripe (cryptocurrency support planned) |
| **Email**       | Nodemailer, Mailtrap                  |

## 🔧 Project Structure

```
gigpanda/
├── frontend/                # React frontend built with Vite
│   ├── src/                 # Source files
│   ├── public/              # Static assets
│   └── ...
├── backend/                 # Node.js Express backend
│   ├── controllers/         # Request handlers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   ├── emailServices/       # Email functionality
│   └── server.js            # Entry point
└── ...
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/gigpanda.git
   cd gigpanda
   ```

2. Install dependencies
   ```
   npm install             # Install backend dependencies
   cd frontend && npm install  # Install frontend dependencies
   ```

3. Set up environment variables
   ```
   # Create .env file in root directory
   cp .env.example .env  # Then edit .env with your values
   ```

4. Start development servers
   ```
   # Start backend server
   npm run dev
   
   # In a separate terminal, start frontend
   cd frontend && npm run dev
   ```

## 👥 Contributing

Pull requests are welcome! Please:

1. Create a feature branch
2. Run `npm run lint` and `npm test`
3. Describe the change clearly in your PR

By contributing you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 👨‍💻 Team Members

- **Abdullah Mansoor** - abdullahmansoor608@gmail.com
- **Abdullah Iftikhar** - ai868419@gmail.com
- **Abdul Moiz** - contact@moizmoiz.com

## 📜 License

This project is licensed under the ISC License.

---

Built with ❤️ by the GigPanda Team
