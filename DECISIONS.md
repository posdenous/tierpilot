# Architectural Decisions

This document captures the key architectural decisions made during TierPilot's development and the reasoning behind them.

## ADR-001: Vanilla JS over React/Vue/Svelte

**Decision:** Use vanilla JavaScript with ES modules instead of a frontend framework.

**Context:** The app is a wizard with 4 stages and simple state management. No complex component trees, no server-side rendering, no shared state between distant components.

**Reasoning:**
- The entire app state fits in a single object with ~10 properties
- DOM updates happen at stage transitions, not continuously
- Bundle size matters for a tool that should load instantly
- Frameworks add complexity that doesn't pay off at this scale
- Easier to understand and modify for contributors

**Trade-offs:**
- Manual DOM manipulation instead of declarative rendering
- No component lifecycle hooks (managed manually)
- Event listener attachment requires explicit cleanup

**Alternatives considered:**
- **Preact** — Would work, but adds a build dependency for minimal benefit
- **Alpine.js** — Good fit, but vanilla is even simpler for this use case

---

## ADR-002: Weighted Scoring over Rule-Based Logic

**Decision:** Use a weighted scoring system where each input adds/subtracts points from each tier, rather than a decision tree or rule-based system.

**Context:** The decision "local vs frontier vs hybrid" depends on 8+ factors that interact in complex ways. A user with confidential data (favors local) but basic hardware (favors frontier) faces a genuine trade-off.

**Reasoning:**
- Real decisions involve trade-offs, not binary choices
- Scoring surfaces tension rather than hiding it behind arbitrary rules
- Easy to tune weights based on feedback
- "EITHER" verdict naturally emerges when scores are close
- Transparent — users can understand why they got a verdict

**Trade-offs:**
- Weights are somewhat arbitrary (tuned by judgment, not data)
- Edge cases may produce unexpected results
- Harder to explain than "if X then Y"

**Alternatives considered:**
- **Decision tree** — Brittle, doesn't handle trade-offs well
- **ML classifier** — Overkill, no training data, black box
- **Expert system with rules** — Too rigid, hard to maintain

---

## ADR-003: models.json as Runtime Fetch

**Decision:** Store the model registry in `public/models.json` and fetch it at runtime rather than importing it as a JS module.

**Context:** Model recommendations change frequently. New models release, old ones deprecate, managed alternatives change.

**Reasoning:**
- Update model list without rebuilding the app
- Could be replaced with an API endpoint in v2
- Graceful degradation — verdict still works if fetch fails
- Clear separation between decision logic and model data

**Trade-offs:**
- Extra HTTP request on load
- Must handle fetch failures gracefully
- No type checking on model data

**Alternatives considered:**
- **Import as JS module** — Requires rebuild for updates
- **Inline in HTML** — Messy, same rebuild problem

---

## ADR-004: CSS Variables for Theming

**Decision:** Define all colors and design tokens as CSS variables in a `@theme` block, never hardcode colors in components.

**Context:** Dark mode is the default, but the design should support future light mode or custom themes.

**Reasoning:**
- Single source of truth for colors
- TailwindCSS 4's `@theme` integrates with utility classes
- Easy to add light mode later (swap variable values)
- Consistent design language across components

**Trade-offs:**
- Slightly more verbose than hardcoded values
- IDE may not recognize `@theme` syntax (linter warning)

---

## ADR-005: Wizard Flow over Single Page

**Decision:** Present questions one at a time with transitions, not all visible simultaneously.

**Context:** The app asks 8 questions (1 task + 7 context). Showing all at once would be overwhelming.

**Reasoning:**
- Reduces cognitive load — one decision at a time
- Progress bar provides momentum and completion sense
- Matches mental model of "guided decision"
- Mobile-friendly — no scrolling through long forms
- Duolingo-style onboarding is proven effective

**Trade-offs:**
- More clicks to complete
- Can't see all questions at once to plan answers
- Back navigation required to change earlier answers

---

## ADR-006: localStorage for Explainer Dismissal

**Decision:** Use localStorage to remember if the user has seen the explainer, skip it on return visits.

**Context:** First-time users need context about local vs frontier trade-offs. Returning users don't want to see it again.

**Reasoning:**
- Simple, no backend required
- Persists across sessions
- Graceful degradation — if localStorage unavailable, show explainer every time

**Trade-offs:**
- Cleared if user clears browser data
- Per-browser, not per-user (no account system)

---

## ADR-007: No Build-Time Task Complexity Mapping

**Decision:** Task complexity is defined inline in `taskSelector.js` rather than derived from a separate configuration.

**Context:** Each task category maps to a complexity level (simple/moderate/complex) that affects scoring.

**Reasoning:**
- Co-locating task definition with complexity makes updates easier
- Only 18 tasks — not enough to warrant a separate config file
- Complexity is inherent to the task, not a separate concern

**Trade-offs:**
- Adding tasks requires code change, not config change
- Complexity values are "magic" without reading the code

---

## ADR-008: Explicit Focus Management

**Decision:** Manually manage focus when transitioning between wizard steps using `manageFocus()` utility.

**Context:** Screen reader and keyboard users lose their place when DOM content changes dynamically.

**Reasoning:**
- WCAG requires focus management for dynamic content
- Moving focus to heading announces the new section
- Consistent experience for keyboard navigation

**Trade-offs:**
- More code than letting browser handle focus
- Must remember to call `manageFocus()` on every render

---

## ADR-009: Share as Plain Text, Not Image

**Decision:** The share button copies a structured plain-text summary to clipboard rather than generating an image.

**Context:** Users want to share their verdict in Slack, GitHub issues, or documentation.

**Reasoning:**
- Plain text works everywhere (Slack, GitHub, email, docs)
- No image generation complexity
- Accessible — screen readers can read the text
- Smaller scope for v1

**Trade-offs:**
- Less visually striking than a screenshot
- No branding/visual identity in shared content

**Future consideration:** Add "Copy as image" using html2canvas in v2.

---

## ADR-010: Vite over Webpack/Parcel

**Decision:** Use Vite as the build tool and dev server.

**Context:** Need a modern build tool that supports ES modules, CSS processing, and fast HMR.

**Reasoning:**
- Fastest dev server startup (native ES modules)
- First-class TailwindCSS 4 support via PostCSS
- Netlify plugin available for seamless deployment
- Simple configuration compared to Webpack
- Industry standard for new projects

**Trade-offs:**
- Vite 6 required for Netlify plugin compatibility (not latest Vite 7)

---

## ADR-011: No API in v1

**Decision:** All decision logic runs client-side in v1. No serverless functions or API calls.

**Context:** The original spec mentioned a Claude API classify function for v2.

**Reasoning:**
- Validate core decision logic before adding complexity
- No API keys to manage
- Works offline after initial load
- Faster iteration on decision weights
- Free tier deployment (no function invocations)

**Future consideration:** v2 will add optional Claude API call to refine verdicts for edge cases.

---

## ADR-012: Hardware Filtering for Model Recommendations

**Decision:** Filter model recommendations based on user's hardware capability.

**Context:** Recommending a 14B model to someone with 8GB RAM and no GPU is unhelpful.

**Reasoning:**
- Actionable recommendations > comprehensive lists
- Prevents frustration of "recommended" models that won't run
- Hardware question already captures this information

**Trade-offs:**
- May hide models user could run with optimization
- Mapping param size to hardware is approximate

---

## Future Considerations

Things explicitly deferred to v2 or later:

1. **Claude API integration** — Refine verdicts for edge cases
2. **Light mode** — CSS variables are ready, just need toggle
3. **Shareable URLs** — Encode answers in URL params
4. **Analytics** — Track which verdicts are most common
5. **Model comparison** — Side-by-side model details
6. **User accounts** — Save history of decisions
