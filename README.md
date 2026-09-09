# DemoGhost

<div align="center">

# 👻

### Your UI. On autopilot.

**Open-source JavaScript & TypeScript UI automation for interactive product demos, user onboarding, product tours, and self-playing interfaces.**

[![npm version](https://img.shields.io/npm/v/demoghost.svg?style=flat-square&color=6366f1)](https://www.npmjs.com/package/demoghost)
[![npm downloads](https://img.shields.io/npm/dm/demoghost.svg?style=flat-square)](https://www.npmjs.com/package/demoghost)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/demoghost?style=flat-square&color=34d399)](https://bundlephobia.com/package/demoghost)
[![CI](https://img.shields.io/github/actions/workflow/status/irontoreofficial/demoghost/ci.yml?branch=master&style=flat-square)](https://github.com/irontoreofficial/demoghost/actions)

[Live Demo & Documentation](https://irontoreofficial.github.io/demoghost/) •
[npm](https://www.npmjs.com/package/demoghost) •
[Releases](https://github.com/irontoreofficial/demoghost/releases) •
[Report a Bug](https://github.com/irontoreofficial/demoghost/issues)

</div>

---

## What is DemoGhost?

**DemoGhost** is an open-source JavaScript/TypeScript library that lets your web application **demonstrate itself directly on the real DOM**.

Instead of recording a video, exporting a GIF, or building a traditional tooltip tour, DemoGhost creates a virtual user that can move through your actual interface and perform real UI interactions.

It can:

- move a virtual cursor
- click real elements
- type into real inputs
- scroll the real page
- highlight important UI
- display captions
- pause and resume playback
- record interactions
- replay reusable scenarios

Your interface stays **real, responsive, searchable, localizable, and interactive**.

```ts
import {
  DemoGhost,
  click,
  type,
  wait,
  highlight
} from "demoghost";

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

Product demos usually rely on prerecorded media or intrusive overlays.

DemoGhost takes a different approach: it operates directly on the application that is already running.

| Approach | Limitation |
| --- | --- |
| 🎥 Video | Becomes outdated when the UI changes |
| 🖼 GIF | Non-interactive, heavy, and difficult to maintain |
| 💬 Tooltip tour | Often interrupts users with overlays and popups |
| 🧪 Playwright / Selenium | Built primarily for test automation and CI |
| 👻 **DemoGhost** | Demonstrates the real UI in the browser |

**DemoGhost does not recreate your interface. It uses your actual interface.**

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

### 3. Create your first self-playing demo

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

Your real interface can now demonstrate itself.

---

## Record and Replay

### Do it once. DemoGhost does it forever.

DemoGhost can record real UI interactions and turn them into reusable scenarios.

```ts
import { DemoGhost } from "demoghost";

const recorder = DemoGhost.record({
  maskPasswords: true
});

// Use your application normally.

const scenario = recorder.stop();

await DemoGhost.play(scenario);
```

Export recorded scenarios as TypeScript:

```ts
const code = DemoGhost.toTypeScript(scenario);
console.log(code);
```

Or JavaScript:

```ts
const code = DemoGhost.toJavaScript(scenario);
console.log(code);
```

This is useful for:

- product onboarding
- SaaS walkthroughs
- interactive documentation
- feature announcements
- support flows
- software education
- internal tool guidance

---

## Real DOM Automation

DemoGhost does not render a fake copy of your application.

Actions target real DOM elements:

```ts
click("#submit");
type("#email", "hello@example.com");
highlight("[data-demo='profile']");
```

Because DemoGhost works against the live DOM, demos can work with:

- responsive layouts
- dynamic content
- real form elements
- live application state
- CSS transitions and animations
- client-side frameworks
- server-rendered applications

---

## Durable Selectors

UI automation becomes fragile when it depends on generated CSS classes, coordinates, or temporary DOM structure.

For long-lived demos, prefer stable selectors:

```html
<button data-demoghost-id="create-project">
  Create Project
</button>
```

Then target the element normally:

```ts
click('[data-demoghost-id="create-project"]');
```

DemoGhost can work with selector strategies based on:

- `data-demoghost-id`
- `id`
- `data-testid`
- semantic attributes
- `aria-label`
- `name`
- text-based matching

For production demos, explicit stable selectors are recommended.

---

## Privacy by Default

Recording UI interactions can expose sensitive values if a library is not designed carefully.

DemoGhost includes privacy-oriented recording behavior for sensitive inputs such as:

```html
<input type="password">
```

Password masking can be enabled when recording:

```ts
const recorder = DemoGhost.record({
  maskPasswords: true
});
```

DemoGhost does not require a remote recording service to replay scenarios.

Your demo logic can remain inside your application.

---

## Accessibility

DemoGhost is designed to respect the user's environment and interaction preferences.

Accessibility-oriented features include:

- `prefers-reduced-motion` support
- keyboard controls
- screen reader announcements
- `aria-live` notifications
- interruptible playback
- accessible playback controls

Typical keyboard controls include:

```text
Escape → Stop demo
Space  → Pause / Resume
```

---

## Natural Cursor Motion

A self-playing interface should not feel like a test script teleporting between elements.

DemoGhost's virtual cursor is designed to create more natural visual movement through:

- curved trajectories
- acceleration
- deceleration
- natural timing
- smooth scrolling
- human-style typing cadence

The goal is not only to automate the UI.

The goal is to create a product demo that is pleasant to watch.

---

## Framework Independent

The main package works directly with the DOM:

```bash
npm install demoghost
```

That means DemoGhost can be used with:

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

No framework adapter is required to use the core `demoghost` package.

---

## Framework Adapters

Official DemoGhost framework adapters are available on npm.

### React

```bash
npm install demoghost @demoghostjs/react
```

```ts
import { useDemoGhost } from "@demoghostjs/react";
```

The React adapter also provides:

```tsx
<DemoGhostProvider>
  <App />
</DemoGhostProvider>
```

Package: [`@demoghostjs/react`](https://www.npmjs.com/package/@demoghostjs/react)

### Vue 3

```bash
npm install demoghost @demoghostjs/vue
```

```ts
import { useDemoGhost } from "@demoghostjs/vue";
```

The Vue adapter also includes:

```ts
DemoGhostPlugin
```

Package: [`@demoghostjs/vue`](https://www.npmjs.com/package/@demoghostjs/vue)

### Angular

```bash
npm install demoghost @demoghostjs/angular
```

```ts
import { DemoGhostService } from "@demoghostjs/angular";
```

The Angular adapter also includes:

```ts
DemoGhostTargetDirective
```

Package: [`@demoghostjs/angular`](https://www.npmjs.com/package/@demoghostjs/angular)

---

## TypeScript Support

DemoGhost ships TypeScript declaration files with the package.

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

## Browser Builds

The main npm package includes browser-ready builds:

```text
dist/demoghost.js
dist/demoghost.min.js
dist/demoghost.css
```

It also ships:

- ESM
- CommonJS
- browser/IIFE build
- TypeScript declarations
- CSS

For production deployments, pin the DemoGhost version you have tested.

---

## Zero Runtime Dependencies

The main DemoGhost package is designed to stay lightweight and self-contained.

```text
Runtime dependencies: 0
```

This keeps installation simple and reduces dependency-chain risk.

---

## Browser Support

DemoGhost is tested against modern browser engines.

| Browser | Support |
| --- | :---: |
| Chrome / Chromium | ✅ |
| Firefox | ✅ |
| Safari / WebKit | ✅ |
| Mobile Chrome | ✅ |
| Mobile Safari | ✅ |

---

## Shadow DOM and Iframes

DemoGhost can interact with modern application structures where the browser security model permits it.

Supported:

```text
Open Shadow DOM
Same-origin iframes
```

Browser security prevents normal page JavaScript from accessing:

```text
Closed Shadow DOM
Cross-origin iframes
```

These are browser platform restrictions rather than DemoGhost-specific limitations.

---

## Use Cases

### Product Onboarding
Show new users how to complete an important first action directly inside your application.

### Interactive Product Demos
Turn a live SaaS interface into a self-playing product demonstration without recording a new video after every UI change.

### Product Tours
Create walkthroughs that interact with the real application instead of only pointing at elements.

### Feature Announcements
Demonstrate newly released features in the context where users will actually use them.

### Interactive Documentation
Let documentation pages demonstrate real application workflows.

### Customer Support
Replay common configuration, setup, and troubleshooting flows.

### Education
Demonstrate software interfaces without depending on prerecorded media.

### Internal Tools
Create guided workflows for complex dashboards and administration panels.

---

## DemoGhost vs Traditional Product Tours

A traditional product tour says:

> "Click this button."

DemoGhost can click it.

A traditional tooltip says:

> "Enter your project name here."

DemoGhost can type it.

A prerecorded video shows what the interface looked like when the video was recorded.

DemoGhost demonstrates the interface that is running now.

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

## Philosophy

DemoGhost is built around one simple idea:

> **Your interface should be able to explain itself.**

A product demo should not need to be rerecorded every time a button moves, a layout changes, or a feature evolves.

The interface is already there.

DemoGhost teaches it how to perform.

---

## Documentation and Playground

Full documentation, examples, and the interactive playground:

### [Open DemoGhost Documentation →](https://irontoreofficial.github.io/demoghost/)

Documentation includes:

- Getting Started
- Playback API
- Actions
- Recorder
- Selectors
- Privacy
- Accessibility
- Framework integrations
- browser usage
- examples
- interactive playground

---

## Development

```bash
git clone https://github.com/irontoreofficial/demoghost.git
cd demoghost
pnpm install
pnpm build
pnpm test
```

Run the documentation locally:

```bash
pnpm --filter demoghost-docs dev
```

---

## Contributing

Contributions are welcome.

You can help by:

- reporting bugs
- proposing features
- improving documentation
- adding examples
- improving framework integrations
- testing DemoGhost in real applications

### [Open an Issue →](https://github.com/irontoreofficial/demoghost/issues)

Pull requests are welcome.

---

## Roadmap

DemoGhost v1 establishes the foundation for self-playing UI demonstrations.

Future development may include:

- richer recorder capabilities
- improved selector resilience
- advanced playback controls
- framework-specific developer experience
- more examples and templates
- additional demo authoring tools
- advanced scenario editing

The roadmap will evolve based on real-world usage and community feedback.

---

## Project Links

- **npm:** https://www.npmjs.com/package/demoghost
- **React adapter:** https://www.npmjs.com/package/@demoghostjs/react
- **Vue adapter:** https://www.npmjs.com/package/@demoghostjs/vue
- **Angular adapter:** https://www.npmjs.com/package/@demoghostjs/angular
- **Documentation:** https://irontoreofficial.github.io/demoghost/
- **GitHub:** https://github.com/irontoreofficial/demoghost
- **Issues:** https://github.com/irontoreofficial/demoghost/issues
- **Releases:** https://github.com/irontoreofficial/demoghost/releases

---

## Search Keywords

`javascript ui automation` •
`typescript ui automation` •
`interactive product demo` •
`self playing ui` •
`product tour` •
`user onboarding` •
`saas demo` •
`dom automation` •
`interactive documentation` •
`react product tour` •
`vue product tour` •
`angular product tour`

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

[Documentation](https://irontoreofficial.github.io/demoghost/) •
[npm](https://www.npmjs.com/package/demoghost) •
[GitHub](https://github.com/irontoreofficial/demoghost)

</div>
