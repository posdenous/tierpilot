<div align="center">

# ⚡ TierPilot

### Local vs Frontier LLM Decision Tool

**Stop guessing. Start shipping.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.javascript.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)

[**Try it Live →**](https://tierpilot.netlify.app) · [Report Bug](https://github.com/yourusername/tierpilot/issues) · [Request Feature](https://github.com/yourusername/tierpilot/issues)

</div>

---

## 🤔 The Problem

You want to add AI to your project. But should you:
- Run **Llama locally** for privacy and zero cost?
- Use **Claude/GPT-4 APIs** for maximum capability?
- Build a **hybrid** with local + cloud?

The answer depends on your data sensitivity, hardware, budget, task complexity, and a dozen other factors. **TierPilot helps you decide in 2 minutes.**

---

## ✨ Features

- 🎯 **21 Task Categories** — From simple summarization to autonomous coding agents
- 🔒 **Privacy-First Analysis** — Weighs data sensitivity and compliance requirements
- 💻 **Hardware-Aware** — Recommends models that actually run on your machine
- 🌍 **5 Languages** — English, German, Spanish, French, Italian
- 🌓 **Light/Dark Mode** — Easy on the eyes
- 📱 **Mobile Responsive** — Works on any device
- ⚡ **Instant Results** — No signup, no tracking, runs entirely in your browser

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/tierpilot.git
cd tierpilot

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📖 How It Works

TierPilot guides you through a simple wizard:

| Step | What Happens |
|------|--------------|
| **1. Pick a Task** | Choose from 21 categories (summarization, code review, chatbots, etc.) |
| **2. Answer 7 Questions** | Data sensitivity, output stakes, hardware, budget, etc. |
| **3. Get Your Verdict** | LOCAL, FRONTIER, HYBRID, or EITHER — with specific model recommendations |

---

## 🧠 Decision Logic

The engine uses **weighted scoring** — each answer adds/subtracts points across three tiers:

| Factor | Local Boost | Frontier Boost |
|--------|-------------|----------------|
| Confidential data | +5 | -3 |
| High output stakes | +1 | +2 |
| Complex task | -2 | +3 |
| High volume | +3 | -2 |
| Cost sensitive | +3 | -2 |
| Basic hardware | -2 | +2 |

**Highest score wins.** If scores are within 2 points → "EITHER" verdict.

> 💡 Hard rules don't capture real trade-offs. A user with confidential data but basic hardware faces a genuine dilemma — the scoring system surfaces this tension.

---

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| **Vite 6** | Build tool & dev server |
| **TailwindCSS 4** | Styling with CSS variables |
| **Vanilla JS** | No framework, ES modules |
| **Netlify** | Hosting & deployment |

---

## 📁 Project Structure

```
tierpilot/
├── public/
│   └── models.json           # Model registry (runtime fetch)
├── src/
│   ├── engine/decision.js    # Scoring logic
│   ├── components/           # UI components
│   ├── locales/              # i18n translations (en, de, es, fr, it)
│   ├── utils/                # Helpers (i18n, theme, share)
│   └── styles/main.css       # TailwindCSS + themes
├── index.html
└── vite.config.js
```

---

## 🚢 Deployment

### Netlify (Recommended)

```bash
# Just push to GitHub — Netlify auto-deploys from netlify.toml
git push origin main
```

### Manual / Other Platforms

```bash
npm run build
# Deploy the dist/ folder anywhere (Vercel, Cloudflare Pages, etc.)
```

---

## 🔧 Customization

### Add/Update Models

Edit `public/models.json`:

```json
{
  "name": "Llama 3.2",
  "provider": "Meta",
  "tier": "local",
  "paramSize": "3B",
  "strengths": ["Fast", "Low memory"],
  "link": "https://...",
  "lastVerified": "2026-05-20"
}
```

No rebuild needed — models load at runtime.

### Add Languages

1. Create `src/locales/xx.json` (copy from `en.json`)
2. Add to `src/utils/i18n.js` imports
3. Add to `SUPPORTED_LANGUAGES` array

---

## ♿ Accessibility

- ✅ Keyboard navigable
- ✅ ARIA labels on all controls
- ✅ Focus management between steps
- ✅ WCAG AA color contrast
- ✅ Screen reader friendly

---

## 🤝 Contributing

PRs welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT © 2026

---

<div align="center">

**Built with ⚡ by developers, for developers**

[⬆ Back to top](#-tierpilot)

</div>
