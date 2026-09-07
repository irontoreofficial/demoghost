# DemoGhost

<div align="center">

<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" fill="#6366f1" stroke="#4f46e5" stroke-width="1.5" stroke-linejoin="round"/>
</svg>

### Your UI. On autopilot.

**Turn your UI into its own demo.**

[![npm version](https://img.shields.io/npm/v/demoghost.svg?style=flat-square&color=6366f1)](https://www.npmjs.com/package/demoghost)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/demoghost?style=flat-square&color=34d399)](https://bundlephobia.com/package/demoghost)
[![CI](https://img.shields.io/github/actions/workflow/status/irontoreofficial/demoghost/ci.yml?branch=master&style=flat-square)](https://github.com/irontoreofficial/demoghost/actions)

[Live Website & Playground](https://demoghost.dev) • [Documentation](https://demoghost.dev/#docs) • [Report Bug](https://github.com/irontoreofficial/demoghost/issues)

</div>

---

## 👻 What is DemoGhost?

**DemoGhost** is an open-source, zero-runtime-dependency JavaScript/TypeScript library that allows your live web applications to demonstrate themselves.

- ❌ **Not a video player:** Videos are blurry, large, non-interactive, and break whenever your UI updates.
- ❌ **Not a GIF:** GIFs cannot be clicked, searched, or localized.
- ❌ **Not a tooltip tour:** Tooltips block the screen with annoying popups.
- ❌ **Not an E2E test runner:** Selenium and Playwright are for CI test automation, not client-side user onboarding.
- ✅ **DemoGhost:** Renders a virtual mouse with natural bezier trajectories, realistic human typing cadences, smooth scrolling, spotlights, and floating Liquid Glass controls on your live DOM.

---

## ⚡ Quick Start

### 1. Install

```bash
npm install demoghost
```

### 2. Code Autopilot

```ts
import { DemoGhost, click, type, wait, highlight, caption } from "demoghost";
import "demoghost/css";

await DemoGhost.play([
  click("#new-project", { caption: "Click to open project form" }),
  type("#project-name", "Quantum SaaS Studio", { speed: "human" }),
  click("#create-project"),
  wait(400),
  highlight("#active-project", { duration: 1500, style: "glow" }),
  caption({ title: "Done!", text: "Your project is ready to launch." })
]);
```

---

## 🎬 Record + Replay

> _"Do it once. DemoGhost does it forever."_

Record your live interactions on your website with automatic password and privacy masking:

```ts
import { DemoGhost } from "demoghost";

// 1. Start recording
const recorder = DemoGhost.record({
  maskPasswords: true
});

// ... Click, fill forms, check boxes on your live website ...

// 2. Stop recording
const scenario = recorder.stop();

// 3. Export to TypeScript snippet
console.log(DemoGhost.toTypeScript(scenario));

// 4. Replay immediately
await DemoGhost.play(scenario);
```

---

## 🌐 CDN Usage (Zero Build Step)

Include DemoGhost directly via jsDelivr or unpkg:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/demoghost/dist/demoghost.css" />

<!-- Script -->
<script src="https://cdn.jsdelivr.net/npm/demoghost/dist/demoghost.min.js"></script>

<script>
  DemoGhost.play([
    DemoGhost.click("#login-btn"),
    DemoGhost.type("#email", "user@example.com"),
    DemoGhost.click("#submit")
  ]);
</script>
```

---

## 🧩 Framework Adapters

DemoGhost works with **any** framework:

- **React:** `@demoghost/react` (`useDemoGhost()`, `<DemoGhostProvider>`)
- **Vue 3:** `@demoghost/vue` (`useDemoGhost()`, `DemoGhostPlugin`)
- **Angular:** `@demoghost/angular` (`DemoGhostService`, `DemoGhostTargetDirective`)
- **Vanilla JS / Svelte / Solid / Astro / Blade / Rails:** First-class support out of the box.

---

## 🎯 Architecture & Design Highlights

- **Zero Runtime Dependencies:** The core package has 0 dependencies.
- **Natural Bezier Physics:** Virtual mouse moves along realistic curved cubic-bezier trajectories with acceleration, deceleration, and overshoot damping.
- **10-Tier Durable Selectors:** Prioritizes `data-demoghost-id`, unique `id`, `data-testid`, semantic attributes, and text matching over fragile coordinate offsets.
- **Privacy & Security:** Zero telemetry. Automatic detection and masking of password fields, tokens, and credit cards.
- **Accessibility:** Full WCAG compliance, screen reader announcements via `aria-live="polite"`, `prefers-reduced-motion` detection, and keyboard controls (Escape to terminate, Space to pause).

---

## 📜 License

MIT License © DemoGhost Authors.
