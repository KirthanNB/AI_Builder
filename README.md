# Ignited Minds — Production-Grade AI Website Builder SaaS Platform

An enterprise-ready, full-stack AI platform that transforms natural language prompts into live, interactive, production-grade React websites with code editing, live AI chat iteration, instant ZIP source code export, public publishing, and a simulated subscription & payment gateway.

---

## 🚀 Key Highlights & Capabilities

- **⚡ Full-Stack Architecture**:
  - **Frontend**: React 19, Vite, Tailwind CSS v4, `@codesandbox/sandpack-react`, Lucide Icons, Framer Motion, React Hot Toast.
  - **Backend**: Node.js, Express, JWT Authentication, Bcrypt password hashing, REST API.
  - **Database**: Dual-engine persistence — connects to **MongoDB Atlas** when `MONGODB_URI` is provided, or seamlessly runs with a **high-performance local embedded JSON database** (`server/data/db.json`) requiring zero setup or installation!
- **🤖 Autonomous AI Engine**:
  - Direct integration with **Google Gemini 1.5 Flash API** (free tier).
  - High-Fidelity **Generative Synthesis Engine** that creates complete multi-component React applications (Header, Hero, Bento Features, Interactive Showcase, Testimonials, Pricing, FAQ, Footer, Dark Mode toggle) tailored to any prompt.
  - AI Copilot Chat panel to iteratively modify layout, add contact forms, switch color schemes, or rewrite copy.
- **🖥️ Live Interactive Sandpack Studio**:
  - Split-screen workspace with real-time browser preview inside Sandpack.
  - Device viewport switcher: Desktop (100%), Tablet (768px), and Mobile (375px).
  - Integrated Code Editor mode with file explorer and syntax highlighting.
- **📦 Zero-Dependency Code Export**:
  - Download full source code as a valid ZIP archive containing `package.json`, `vite.config.js`, `index.html`, and all generated React components.
  - Ready to deploy directly to Vercel, Netlify, or AWS.
- **💳 Monetization & Payment System**:
  - Tiered Subscription Plans: Starter (Free), Pro Builder ($19/mo or ₹799/mo), and Agency Scale ($49/mo or ₹2,499/mo).
  - Realistic simulated payment gateway supporting Credit/Debit Cards and UPI/QR code scanning with order verification, automatic credit balance top-up, and transaction history.
- **🌐 Public Website Showcase**:
  - Shareable public links (`/preview/:id` or `/publish/:id`) allowing clients to view published websites without needing to sign in.

---

## 🛠️ Project Structure

```text
AI_Builder/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets (logo.svg, bg images)
│   ├── src/
│   │   ├── api/                # Axios client with JWT interceptor & fallback adapter
│   │   ├── assets/             # Inspiration tags and constants
│   │   ├── components/         # Loading, LoginLeft, PricingModal
│   │   ├── context/            # AppContext (user session, projects, credits)
│   │   ├── pages/              # AuthPage, HomePage, BuilderPage, PreviewPage, PublishPage
│   │   ├── utils/              # Export ZIP generator, dependency detector
│   │   ├── App.jsx             # React Router routing structure
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js          # Configured with /api proxy to localhost:5000
│
├── server/                     # Production Express Backend API
│   ├── config/                 # Database connector (MongoDB + JSON fallback)
│   ├── data/                   # Embedded persistent database storage
│   ├── middleware/             # JWT auth protection middleware
│   ├── models/                 # User, Project, Transaction models
│   ├── routes/                 # authRoutes, projectRoutes, paymentRoutes
│   ├── services/               # aiService (Gemini API + Generative Engine)
│   ├── .env                    # Environment configuration
│   ├── package.json
│   └── server.js               # Express application entry point
│
└── package.json                # Root scripts to run both client and server
```

---

## 🏁 Quick Start Guide

### 1. Install Dependencies
```bash
# Install root & backend dependencies
npm install
npm --prefix server install

# Client dependencies are already installed in client/node_modules
```

### 2. Configure Environment Variables (Optional)
The backend already runs out-of-the-box with persistent storage. If you want to connect external services, edit `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_free_google_ai_studio_api_key
```
*(If `GEMINI_API_KEY` is omitted, the built-in Generative Synthesis Engine will automatically produce high-fidelity websites without any external API calls!)*

### 3. Run the Application
Open two terminal windows:

**Terminal 1 — Backend Server:**
```bash
npm run server
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend Client:**
```bash
npm run client
# Client starts on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser to sign in or create an account and start generating websites!

---

## 💰 Monetization & Earnings Flow

1. **User Sign Up**: New accounts receive 20 initial AI generation credits on the Starter plan.
2. **AI Generation**: Generating a new website or requesting chat revisions deducts 1 credit.
3. **Upgrade Trigger**: When credits run out or when users click "Upgrade Plan", the interactive checkout modal opens.
4. **Checkout Simulation**: Supports USD ($) and INR (₹) pricing with Card and UPI simulation.
5. **Instant Credit Activation**: Verifies the order, activates the Pro or Enterprise tier, grants 200 or 1,000 credits, and logs the billing receipt.

