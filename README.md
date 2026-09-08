# DemoGhost

<div align="center">

# 👻

### Your UI. On autopilot.

**Turn your real UI into an interactive self-playing demo.**

[![npm version](https://img.shields.io/npm/v/demoghost.svg?style=flat-square&color=6366f1)](https://www.npmjs.com/package/demoghost)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/demoghost?style=flat-square&color=34d399)](https://bundlephobia.com/package/demoghost)
[![CI](https://img.shields.io/github/actions/workflow/status/irontoreofficial/demoghost/ci.yml?branch=master&style=flat-square)](https://github.com/irontoreofficial/demoghost/actions)

[Live Demo & Playground](https://demoghost.dev) •
[Documentation](https://demoghost.dev) •
[npm](https://www.npmjs.com/package/demoghost) •
[Report Bug](https://github.com/irontoreofficial/demoghost/issues)

</div>

---

## What is DemoGhost?

**DemoGhost** is an open-source JavaScript/TypeScript library that lets your web application **demonstrate itself directly on the real DOM**.

Instead of recording a video or placing tooltip boxes around the page, DemoGhost creates a virtual user that can:

- move a virtual cursor
- click real elements
- type into real inputs
- scroll the real page
- highlight UI elements
- show captions
- pause and continue
- record interactions
- replay scenarios

Your interface stays **real, responsive and interactive**.

```ts
await DemoGhost.play([
  click("#new-project"),
  type("#project-name", "Launch Website"),
  click("#create-project"),
  wait(500),
  highlight("#created-project")
]);
```

---

## Why DemoGhost?

Traditional product demos usually fall into one of these categories:

| Approach | Problem |
| --- | --- |
| 🎥 Video | Becomes outdated when the interface changes |
| 🖼 GIF | Non-interactive and difficult to maintain |
| 💬 Tooltip tour | Interrupts the user with overlays and popups |
| 🧪 Playwright / Selenium | Designed primarily for automated testing |
| 👻 **DemoGhost** | Operates directly on your live interface |

DemoGhost does not reproduce your interface.

**It uses your actual interface.**

---

## Quick Start

### 1. Install

```bash
npm install demoghost
```

### 2. Import

```ts
import {
  DemoGhost,
  click,
  type,
  wait,
  highlight,
  caption
} from "demoghost";

import "demoghost/css";
```

### 3. Create your first demo

```ts
await DemoGhost.play([
  click("#new-project", {
    caption: "Open the project form"
  }),

  type("#project-name", "Quantum SaaS Studio", {
    speed: "human"
  }),

  click("#create-project"),

  wait(400),

  highlight("#active-project", {
    duration: 1500,
    style: "glow"
  }),

  caption({
    title: "Done!",
    text: "Your project is ready to launch."
  })
]);
```

That's it.

Your interface now demonstrates itself.

---

## Record + Replay

### Do it once. DemoGhost does it forever.

You can record real interactions and turn them into reusable DemoGhost scenarios.

```ts
import { DemoGhost } from "demoghost";

// Start recording
const recorder = DemoGhost.record({
  maskPasswords: true
});

// Use your application normally...
// Click buttons, fill forms, select items, etc.

// Stop recording
const scenario = recorder.stop();

// Replay the recorded scenario
await DemoGhost.play(scenario);
```

You can also export the scenario as code:

```ts
const typescriptCode = DemoGhost.toTypeScript(scenario);

console.log(typescriptCode);
```

Or:

```ts
const javascriptCode = DemoGhost.toJavaScript(scenario);

console.log(javascriptCode);
```

This makes it possible to:

- record onboarding flows
- capture feature demonstrations
- generate reproducible tutorials
- create product walkthroughs
- build interactive documentation

---

## Example Scenario

Imagine a project management application.

Instead of recording a video showing how to create a project:

```ts
await DemoGhost.play([
  click("#projects"),

  click("#new-project"),

  type("#project-name", "Website Redesign"),

  type(
    "#project-description",
    "Redesign the company website"
  ),

  click("#save-project"),

  wait(500),

  highlight("#project-card")
]);
```

If the application layout changes later, you do not need to record an entirely new video.

DemoGhost still interacts with the real interface.

---

## Real DOM Automation

DemoGhost does not render a fake copy of your application.

Actions target real DOM elements:

```ts
click("#submit");
```

```ts
type("#email", "hello@example.com");
```

```ts
highlight("[data-demo='profile']");
```

This means demos can continue to work with:

- responsive layouts
- dynamic content
- live application state
- CSS animations
- frontend frameworks
- real form elements

---

## Durable Selectors

UI automation becomes fragile when selectors depend on generated CSS classes or screen coordinates.

DemoGhost uses a selector strategy designed for durable demos.

Whenever possible, prefer explicit DemoGhost identifiers:

```html
<button data-demoghost-id="create-project">
  Create Project
</button>
```

Then target them normally:

```ts
click('[data-demoghost-id="create-project"]');
```

DemoGhost can also work with:

```html
id
data-testid
aria-label
name
semantic attributes
text-based matches
```

Explicit selectors are recommended for long-lived production demos.

---

## Privacy by Default

Recording UI interactions can involve sensitive information.

DemoGhost includes privacy-oriented recording behavior for fields such as:

```html
<input type="password">
```

and supports masking sensitive input values.

```ts
const recorder = DemoGhost.record({
  maskPasswords: true
});
```

DemoGhost does not require a remote recording service to replay scenarios.

Your demo logic can remain inside your application.

---

## Accessibility

DemoGhost is designed to respect the user's environment.

Features include:

- `prefers-reduced-motion` support
- keyboard controls
- screen reader announcements
- `aria-live` notifications
- interruptible playback
- accessible UI controls

Typical controls include:

```text
Escape → Stop demo
Space  → Pause / Resume
```

---

## Natural Motion

DemoGhost's virtual cursor is designed to feel like a person operating the interface rather than an automation script instantly teleporting between elements.

Cursor movement can include:

- curved trajectories
- acceleration
- deceleration
- natural timing
- smooth scrolling
- human-style typing cadence

The goal is not simply to automate the page.

The goal is to create a demo that is pleasant to watch.

---

## Framework Independent

The main package works directly with the DOM.

```bash
npm install demoghost
```

So DemoGhost can be used with:

- Vanilla JavaScript
- TypeScript
- React
- Vue
- Angular
- Svelte
- Solid
- Astro
- Next.js
- Nuxt
- Laravel Blade
- Rails
- traditional server-rendered applications

No framework adapter is required to use the core library.

---

## Framework Adapters

Dedicated adapters are also maintained in the DemoGhost repository:

```text
packages/react
packages/vue
packages/angular
```

They provide framework-specific APIs such as:

### React

```ts
useDemoGhost()
```

```tsx
<DemoGhostProvider>
  <App />
</DemoGhostProvider>
```

### Vue

```ts
useDemoGhost()
```

```ts
DemoGhostPlugin
```

### Angular

```ts
DemoGhostService
```

```ts
DemoGhostTargetDirective
```

> Framework adapter npm packages will be published separately.

The main `demoghost` package remains framework-independent.

---

## Browser Usage

DemoGhost also ships browser-ready builds inside the npm package.

Package files include:

```text
dist/demoghost.js
dist/demoghost.min.js
dist/demoghost.css
```

CDN providers may require a short propagation period after a new npm release.

For production applications, pin the DemoGhost version instead of relying on `latest`.

Example structure:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/demoghost@1.0.0/dist/demoghost.css"
/>

<script src="https://cdn.jsdelivr.net/npm/demoghost@1.0.0/dist/demoghost.min.js"></script>
```

---

## TypeScript

DemoGhost is written with TypeScript support in mind and ships type declarations with the package.

```ts
import {
  DemoGhost,
  click,
  type,
  wait
} from "demoghost";
```

No separate `@types` package is required.

---

## Package Formats

DemoGhost ships multiple builds:

```text
ESM
CommonJS
IIFE / Browser
TypeScript declarations
CSS
```

Example:

```ts
import { DemoGhost } from "demoghost";
```

And CSS:

```ts
import "demoghost/css";
```

---

## Zero Runtime Dependencies

The DemoGhost core package is designed to remain lightweight and self-contained.

```text
Runtime dependencies: 0
```

This helps keep installation simple and reduces dependency-chain risk.

---

## Architecture

DemoGhost is maintained as a modular monorepo.

```text
demoghost/
│
├── packages/
│   ├── core/
│   ├── recorder/
│   ├── controls/
│   ├── demoghost/
│   ├── react/
│   ├── vue/
│   └── angular/
│
├── apps/
│   └── docs/
│
├── examples/
│   ├── cdn/
│   ├── vanilla/
│   ├── react/
│   ├── vue/
│   └── angular/
│
└── tests/
    └── e2e/
```

The public `demoghost` package combines the pieces required by most consumers into a simple installation experience.

---

## Browser Support

DemoGhost is tested against modern browsers including:

| Browser | Support |
| --- | :---: |
| Chrome / Chromium | ✅ |
| Firefox | ✅ |
| Safari / WebKit | ✅ |
| Mobile Chrome | ✅ |
| Mobile Safari | ✅ |

---

## Shadow DOM & Iframes

DemoGhost supports interaction with modern application structures where browser security permits it.

Supported:

```text
Open Shadow DOM
Same-origin iframes
```

Browser security prevents JavaScript libraries from accessing:

```text
Closed Shadow DOM
Cross-origin iframes
```

These are browser platform limitations rather than DemoGhost-specific restrictions.

---

## Use Cases

DemoGhost can be used for:

### Product onboarding

Show users how to perform their first important action.

### Feature announcements

Demonstrate a newly released feature directly inside the application.

### Interactive documentation

Let documentation pages demonstrate real workflows.

### SaaS demos

Create self-running demonstrations without maintaining recorded videos.

### Support

Replay common troubleshooting or configuration steps.

### Education

Demonstrate how software interfaces work without requiring prerecorded media.

### Internal tools

Create guided workflows for complex administration panels.

---

## DemoGhost vs Product Tours

A traditional product tour usually says:

> "Click this button."

DemoGhost can actually click it.

A traditional tooltip says:

> "Enter your project name here."

DemoGhost can type it.

A video shows:

> what somebody did yesterday.

DemoGhost shows:

> what your real interface does right now.

---

## Philosophy

DemoGhost is built around one simple idea:

> **Your interface should be able to explain itself.**

A product demo should not need to become outdated every time a button moves or a design changes.

The interface is already there.

DemoGhost simply teaches it how to perform.

---

## Documentation

Full documentation, examples and the interactive playground:

### → [Open DemoGhost Documentation](https://demoghost.dev)

The documentation includes:

- Getting Started
- Playback API
- Actions
- Recorder
- Selectors
- Privacy
- Accessibility
- Framework integrations
- CDN usage
- Examples
- Interactive playground

---

## Development

Clone the repository:

```bash
git clone https://github.com/irontoreofficial/demoghost.git
```

Enter the project:

```bash
cd demoghost
```

Install dependencies:

```bash
pnpm install
```

Build the project:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Run the documentation locally:

```bash
pnpm --filter demoghost-docs dev
```

---

## Contributing

Contributions are welcome.

If you would like to:

- report a bug
- propose a feature
- improve documentation
- add an example
- improve framework support

open an issue or submit a pull request.

### → [Open an Issue](https://github.com/irontoreofficial/demoghost/issues)

---

## Roadmap

DemoGhost v1 establishes the foundation for self-playing UI demonstrations.

Future areas of development may include:

- additional recorder capabilities
- improved selector resilience
- richer playback controls
- framework-specific developer experience
- more examples and templates
- additional demo authoring tools
- advanced scenario editing

The roadmap will evolve based on real-world usage and community feedback.

---

## Project Links

- **npm:** https://www.npmjs.com/package/demoghost
- **Documentation:** https://demoghost.dev
- **GitHub:** https://github.com/irontoreofficial/demoghost
- **Issues:** https://github.com/irontoreofficial/demoghost/issues
- **Releases:** https://github.com/irontoreofficial/demoghost/releases

---

## License

DemoGhost is released under the [MIT License](LICENSE).

```text
MIT License
Copyright © DemoGhost Authors
```

---

<div align="center">

### 👻 DemoGhost

**Your UI. On autopilot.**

**Turn your UI into its own demo.**

Open-source and maintained by **Irontore**.

[Documentation](https://demoghost.dev) •
[npm](https://www.npmjs.com/package/demoghost) •
[GitHub](https://github.com/irontoreofficial/demoghost)

</div>
