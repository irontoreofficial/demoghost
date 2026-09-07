# Changelog

All notable changes to DemoGhost will be documented in this file.

## [1.0.0] - 2026-09-07

### Initial Production Release

- **Core Engine:**
  - Zero runtime dependencies architecture.
  - Natural bezier curve virtual mouse physics with customizable easing and momentum.
  - Complete action suite: `click`, `type`, `move`, `scroll`, `hover`, `focus`, `blur`, `clear`, `check`, `uncheck`, `select`, `press`, `highlight`, `caption`, `drag`.
  - Mobile touch indicator simulation with tap ripples, long press, and swipe trails.
  - Smooth auto-scrolling with sticky header offset management.
  - Spotlight cutouts, soft glow, outlines, and pulse highlights.
  - Pluggable custom action registry adhering to Open/Closed Principle.
- **Record & Replay Engine:**
  - 10-tier durable selector strategy (`data-demoghost-id`, IDs, test attributes, semantic roles, text matching).
  - Built-in zero-leak privacy masker for passwords, payment fields, and private elements.
  - Real-time serialization to JSON and formatted TypeScript / JavaScript code generator.
- **Liquid Glass Controls:**
  - Floating HUD controller with step progress, play/pause, restart, skip, close, and speed changer.
- **Framework Adapters:**
  - `@demoghost/react`: Context provider and `useDemoGhost()` hook.
  - `@demoghost/vue`: Vue 3 plugin and `useDemoGhost()` composable.
  - `@demoghost/angular`: Standalone `DemoGhostService` and `[demoGhostTarget]` directive.
- **CDN Distribution:**
  - Pre-bundled IIFE (`demoghost.min.js`) and ESM distributions.
- **Documentation & Playgrounds:**
  - Liquid Glass docs website with interactive Code Playground, live Recorder Playground, and self-demonstrating "Watch DemoGhost" mode.
