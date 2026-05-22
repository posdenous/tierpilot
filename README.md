# TierPilot

Interactive decision tool that helps technical users (developers, AI leads, product managers) decide whether to use a local LLM, a frontier API model, or a hybrid approach for a given task.

![TierPilot Screenshot](https://via.placeholder.com/800x400?text=TierPilot+Screenshot)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How It Works

TierPilot guides users through a wizard-style flow:

1. **Task Selection** — Pick from 18 task categories (summarisation, code review, autonomous coding, etc.)
2. **Context Questions** — Answer 7 questions about data sensitivity, output stakes, hardware, cost, etc.
3. **Verdict** — Get a recommendation (LOCAL, FRONTIER, HYBRID, or EITHER) with model suggestions

## Decision Logic

The decision engine (`src/engine/decision.js`) uses a weighted scoring system. Each user input adds or subtracts points from three tiers:

| Factor | What it measures | Key insight |
|--------|------------------|-------------|
| **Task complexity** | Simple → Complex | Complex tasks (autonomous agents, research synthesis) need frontier capability |
| **Data sensitivity** | Public → Confidential | Confidential data strongly favors local to avoid compliance risk |
| **Output stakes** | Low → High | High-stakes outputs warrant more reliable models |
| **Volume/frequency** | Occasional → High volume | API costs add up at scale; local has zero marginal cost |
| **Hardware** | Basic laptop → Cloud | Hardware sets a floor on what local models are possible |
| **Tooling comfort** | CLI → Managed only | Practical friction matters — capability is useless if you can't set it up |
| **Cost sensitivity** | High → Low | Budget constraints are real |
| **Structured output** | Yes → No | Smaller models struggle with reliable JSON |

The tier with the highest score wins. If scores are within 2 points, the verdict is "EITHER".

### Why Weighted Scoring?

Hard rules don't capture real-world trade-offs. A user with confidential data but basic hardware faces a genuine dilemma — the scoring system surfaces this tension rather than hiding it.

## Updating models.json

The model registry lives at `public/models.json`. To add or update models:

```json
{
  "name": "Model Name",
  "provider": "Organisation",
  "tier": "local" | "frontier" | "hybrid",
  "paramSize": "7B",
  "minHardware": "16GB RAM, M-series Mac",
  "strengths": ["Strength 1", "Strength 2"],
  "bestFor": ["Task type 1", "Task type 2"],
  "managedAlternative": "Together AI, Replicate" | null,
  "link": "https://...",
  "lastVerified": "2026-05-20"
}
```

The app fetches this file at runtime, so updates don't require rebuilding.

## Adding Task Categories

Task categories are defined in `src/components/taskSelector.js`:

```javascript
{
  id: 'task-id',           // URL-safe identifier
  name: 'Task Name',       // Display name
  description: 'What this task covers',
  complexity: 'simple' | 'moderate' | 'complex'
}
```

Complexity affects the base scoring:
- **simple** — Favors local models (+3 local, +1 frontier)
- **moderate** — Neutral (+2 each)
- **complex** — Favors frontier (+0 local, +3 frontier)

## Project Structure

```
tierpilot/
├── public/
│   └── models.json          # Model registry (fetched at runtime)
├── src/
│   ├── engine/
│   │   └── decision.js      # Decision logic with inline reasoning
│   ├── components/
│   │   ├── explainer.js     # Stage 0 - First-load explainer
│   │   ├── taskSelector.js  # Stage 1 - Task category grid
│   │   ├── wizard.js        # Stage 2 - Context questions
│   │   └── verdict.js       # Stage 3 - Result card
│   ├── utils/
│   │   ├── storage.js       # localStorage helpers
│   │   ├── accessibility.js # Focus management, ARIA
│   │   └── share.js         # Clipboard share
│   ├── styles/
│   │   └── main.css         # TailwindCSS 4 + CSS variables
│   ├── app.js               # App orchestration
│   └── main.js              # Entry point
├── index.html
├── vite.config.js
├── netlify.toml
└── DECISIONS.md             # Architectural decisions
```

## Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repo to Netlify
3. Netlify auto-detects settings from `netlify.toml`

Or deploy manually:

```bash
npm run build
# Upload dist/ to Netlify
```

### Other Platforms

The `dist/` folder after `npm run build` is static HTML/CSS/JS. Deploy anywhere that serves static files.

## Tech Stack

- **Vite 6** — Build tool and dev server
- **TailwindCSS 4** — Utility-first CSS with `@theme` design tokens
- **Vanilla JS** — No framework, ES modules
- **@netlify/vite-plugin** — Netlify integration

## Accessibility

- All interactive elements are keyboard navigable
- Focus is managed explicitly between wizard steps
- ARIA labels on all buttons and inputs
- Color contrast meets WCAG AA
- Screen reader announcements for dynamic content

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). No IE11 support.

## License

MIT
