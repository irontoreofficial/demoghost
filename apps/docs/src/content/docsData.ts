export interface DocSection {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const DOCS_SECTIONS: DocSection[] = [
  {
    id: "intro",
    title: "Introduction",
    category: "Getting Started",
    content: `
# Introduction to DemoGhost

**DemoGhost** is an open-source, zero-runtime-dependency JavaScript/TypeScript library designed to turn your live web interface into its own self-playing interactive product demo.

> **Slogan:** *Your UI. On autopilot. Turn your UI into its own demo.*

### Why DemoGhost?
- **Not a Video Player:** Videos are blurry, non-interactive, bandwidth-heavy, and quickly become outdated whenever your UI changes.
- **Not a GIF:** GIFs lack crisp resolution and provide zero interactive capabilities.
- **Not a Clunky Tooltip Tour:** Traditional onboarding tours block the UI with giant text bubbles that users instinctively close.
- **Not an E2E Framework:** Unlike Selenium or Playwright, DemoGhost runs directly inside the client's browser, driving real DOM elements with human-like bezier mouse trajectories, natural typing cadences, and Liquid Glass visual cues.
`
  },
  {
    id: "installation",
    title: "Installation",
    category: "Getting Started",
    content: `
# Installation

DemoGhost is available across npm, yarn, pnpm, and modern CDNs.

\`\`\`bash
# npm
npm install demoghost

# pnpm
pnpm add demoghost

# yarn
yarn add demoghost
\`\`\`

### Stylesheet
Always include the scoped stylesheet in your application entry point:
\`\`\`ts
import "demoghost/css";
\`\`\`
`
  },
  {
    id: "quick-start",
    title: "Quick Start",
    category: "Getting Started",
    content: `
# Quick Start

Writing your first self-playing demo takes under 60 seconds:

\`\`\`ts
import { DemoGhost, click, type, wait, focus, highlight } from "demoghost";
import "demoghost/css";

await DemoGhost.play([
  click("#new-project"),
  type("#project-name", "Launch Website", { speed: "human" }),
  click("#create-project"),
  wait(400),
  highlight("#newly-created-project", { style: "glow", duration: 1500 })
]);
\`\`\`
`
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    category: "Architecture",
    content: `
# Core Concepts

DemoGhost is built upon four foundational pillars:
1. **Target Resolver:** A robust engine that locates DOM targets by CSS query, \`data-demoghost-id\`, semantic attributes, or text content.
2. **Cursor Engine:** Renders natural bezier curves with acceleration, inertia, click ripples, and mobile touch simulation.
3. **Action Dispatcher:** Dispatches genuine synthetic DOM events so reactive frameworks (React, Vue, Angular, Svelte, vanilla) detect changes as real user inputs.
4. **Playback Controller:** State machine managing play, pause, resume, step forward/back, and speeds.
`
  },
  {
    id: "actions",
    title: "Actions Reference",
    category: "Core API",
    content: `
# Built-in Actions

DemoGhost includes a comprehensive suite of actions:

- \`move(target, options)\`: Moves cursor along a natural bezier curve.
- \`click(target, options)\`: Clicks target and creates a ripple animation.
- \`doubleClick(target)\`: Dispatches double click.
- \`rightClick(target)\`: Dispatches contextmenu event.
- \`type(target, text, options)\`: Human-like keystroke input with random variance.
- \`clear(target)\`: Clears input field.
- \`focus(target)\`: Focuses element.
- \`blur(target)\`: Removes focus.
- \`wait(ms | condition)\`: Pauses playback or awaits a condition.
- \`waitFor(selector | options)\`: Waits for an element to appear or change state.
- \`scroll(target | options)\`: Scrolls target into view with sticky-header offset handling.
- \`scrollTo(x, y)\`: Scrolls to specific coordinates.
- \`select(target, value)\`: Selects dropdown option and triggers change event.
- \`check(target)\` / \`uncheck(target)\`: Toggles checkbox/radio buttons.
- \`hover(target, duration)\`: Hovers over target.
- \`press(key)\`: Dispatches keyboard key.
- \`highlight(target, options)\`: Soft glow, spotlight cutout, outline, or pulse.
- \`caption(textOrOptions)\`: Shows Liquid Glass explanation tooltip.
- \`drag(source, target)\`: Drags source element to target.
`
  },
  {
    id: "playback",
    title: "Playback Controller",
    category: "Core API",
    content: `
# Playback Controller

\`DemoGhost.play()\` returns an interactive controller:

\`\`\`ts
const playback = DemoGhost.play(scenario, {
  speed: 1,
  theme: "glass",
  controls: true
});

// Control methods
playback.pause();
playback.resume();
playback.stop();
playback.restart();
playback.next();
playback.previous();

// State inspection
console.log(playback.state); // "playing" | "paused" | "completed" | "stopped"

// Await completion
await playback.finished;
\`\`\`
`
  },
  {
    id: "recorder",
    title: "Record + Replay",
    category: "Recorder",
    content: `
# Record + Replay

Record user interactions directly on your live UI and replay them forever:

\`\`\`ts
const recorder = DemoGhost.record({
  maskPasswords: true,
  captureScroll: true
});

// User interacts on page...

// Stop and retrieve scenario
const scenario = recorder.stop();

// Export as TypeScript code snippet
const code = DemoGhost.toTypeScript(scenario);
console.log(code);

// Replay immediately
await DemoGhost.play(scenario);
\`\`\`
`
  },
  {
    id: "selectors",
    title: "Selectors Strategy",
    category: "Recorder",
    content: `
# 10-Tier Smart Selector Engine

DemoGhost prioritizes durable, resilient DOM selectors over fragile coordinate offsets:

1. \`data-demoghost-id\` attribute (explicit IDs)
2. Unique \`id\` (#my-button)
3. Stable test attributes (\`data-testid\`, \`data-cy\`, \`data-action\`)
4. Semantic attributes (\`name\`, \`aria-label\`, \`role\`, \`placeholder\`)
5. Text + tag combination (\`button:contains("Submit")\`)
6. Unique CSS class combinations
7. Hierarchical structural selector (\`main > form > div:nth-of-type(2)\`)
`
  },
  {
    id: "controls",
    title: "Liquid Glass Controls",
    category: "UI & Styling",
    content: `
# Liquid Glass Controls HUD

When \`controls: true\` is configured, a floating glass HUD appears:

- Step badge indicator (\`Step 2 / 5\`)
- Liquid glowing progress bar
- Play / Pause / Previous / Next / Restart / Close buttons
- Speed selector (0.5x, 1x, 1.5x, 2x)
- Full keyboard accessibility (Escape to close, Space to pause/resume)
`
  },
  {
    id: "themes",
    title: "Themes & Styling",
    category: "UI & Styling",
    content: `
# Themes & CSS Custom Properties

DemoGhost provides built-in themes (\`"glass"\`, \`"dark"\`, \`"light"\`, \`"auto"\`) and custom CSS variables:

\`\`\`css
:root {
  --demoghost-accent: #6366f1;
  --demoghost-cursor: #0f172a;
  --demoghost-glass-bg: rgba(255, 255, 255, 0.75);
  --demoghost-border: rgba(226, 232, 240, 0.8);
  --demoghost-text: #0f172a;
  --demoghost-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
}
\`\`\`
`
  },
  {
    id: "events",
    title: "Events",
    category: "Advanced",
    content: `
# Strongly Typed Event System

Subscribe to lifecycle events:

\`\`\`ts
DemoGhost.on("start", ({ scenario }) => console.log("Demo started", scenario));
DemoGhost.on("step:start", ({ step, index, total }) => console.log(\`Step \${index + 1}/\${total}\`));
DemoGhost.on("step:complete", ({ step }) => console.log("Step finished", step));
DemoGhost.on("pause", () => console.log("Paused"));
DemoGhost.on("resume", () => console.log("Resumed"));
DemoGhost.on("complete", () => console.log("Demo finished!"));
DemoGhost.on("error", ({ error, stepIndex }) => console.error("Error at step", stepIndex, error));
\`\`\`
`
  },
  {
    id: "react",
    title: "React Adapter",
    category: "Frameworks",
    content: `
# @demoghost/react

Official React 18 & 19 adapter:

\`\`\`tsx
import { DemoGhostProvider, useDemoGhost } from "@demoghost/react";
import { click, type } from "demoghost";
import "demoghost/css";

function MyComponent() {
  const { play, isPlaying } = useDemoGhost();

  return (
    <button onClick={() => play([click("#demo-btn")])}>
      {isPlaying ? "Running..." : "Start Demo"}
    </button>
  );
}
\`\`\`
`
  },
  {
    id: "vue",
    title: "Vue Adapter",
    category: "Frameworks",
    content: `
# @demoghost/vue

Official Vue 3 Composition API adapter:

\`\`\`ts
import { createApp } from "vue";
import { DemoGhostPlugin } from "@demoghost/vue";
import "demoghost/css";

const app = createApp(App);
app.use(DemoGhostPlugin);
app.mount("#app");
\`\`\`

In your Vue component:
\`\`\`vue
<script setup>
import { useDemoGhost } from "@demoghost/vue";
import { click } from "demoghost";

const { play, isPlaying } = useDemoGhost();
</script>
\`\`\`
`
  },
  {
    id: "angular",
    title: "Angular Adapter",
    category: "Frameworks",
    content: `
# @demoghost/angular

Modern standalone Angular adapter:

\`\`\`ts
import { Component } from "@angular/core";
import { DemoGhostService, DemoGhostTargetDirective } from "@demoghost/angular";
import { click, type } from "demoghost";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [DemoGhostTargetDirective],
  template: \`
    <button demoGhostTarget="submit-btn">Submit</button>
  \`
})
export class AppComponent {
  constructor(private demo: DemoGhostService) {}

  startDemo() {
    this.demo.play([click("[data-demoghost-id='submit-btn']")]);
  }
}
\`\`\`
`
  },
  {
    id: "cdn",
    title: "CDN Distribution",
    category: "Frameworks",
    content: `
# CDN Distribution

Use DemoGhost directly via script tags with zero build step:

\`\`\`html
<!-- Include stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/demoghost/dist/demoghost.css">

<!-- Include IIFE bundle -->
<script src="https://cdn.jsdelivr.net/npm/demoghost/dist/demoghost.min.js"></script>

<script>
  DemoGhost.play([
    DemoGhost.click("#button"),
    DemoGhost.type("#input", "Hello world!")
  ]);
</script>
\`\`\`
`
  },
  {
    id: "accessibility",
    title: "Accessibility (WCAG)",
    category: "Compliance",
    content: `
# Accessibility Compliance

DemoGhost is engineered with accessibility at its core:
- **prefers-reduced-motion:** Animations transition instantaneously when reduced motion is preferred.
- **Screen Reader Announcements:** Steps and captions are announced via an off-screen \`aria-live="polite"\` live region.
- **Focus Restoration:** Original focus is saved before demo begins and restored upon completion.
- **Keyboard Shortcuts:** Press \`Escape\` anytime to immediately terminate playback.
`
  },
  {
    id: "security",
    title: "Security & Privacy",
    category: "Compliance",
    content: `
# Security & Privacy

DemoGhost follows strict privacy protocols:
- **Zero Telemetry:** No analytics, tracking beacons, or network telemetry.
- **Automatic Password Masking:** \`input[type="password"]\` is never captured.
- **Sensitive Field Detection:** Credit cards, CVVs, tokens, and \`[data-demoghost-private]\` fields are automatically masked.
`
  }
];
