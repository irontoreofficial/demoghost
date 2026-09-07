import { DemoStep } from "demoghost";

export interface PlaygroundPreset {
  id: string;
  name: string;
  description: string;
  code: string;
  steps: DemoStep[];
}

export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: "create-project",
    name: "Create Project",
    description: "Launches a new project in the workspace with custom category selection",
    code: `[
  click("#pg-new-project-btn", { caption: "Click to open project modal" }),
  wait(300),
  type("#pg-project-name", "Quantum AI Studio", { speed: "human", caption: "Enter new project name" }),
  select("#pg-project-cat", "ai"),
  click("#pg-submit-project", { caption: "Create project" }),
  wait(400),
  highlight("#pg-active-project", { duration: 1500, style: "glow" }),
  caption({ title: "Done!", text: "Project initialized successfully." })
]`,
    steps: [
      { type: "click", target: "#pg-new-project-btn", caption: "Click to open project modal" },
      { type: "wait", duration: 300 },
      {
        type: "type",
        target: "#pg-project-name",
        value: "Quantum AI Studio",
        speed: "human",
        caption: "Enter new project name"
      },
      { type: "select", target: "#pg-project-cat", value: "ai" },
      { type: "click", target: "#pg-submit-project", caption: "Create project" },
      { type: "wait", duration: 400 },
      { type: "highlight", target: "#pg-active-project", duration: 1500, style: "glow" },
      { type: "caption", options: { title: "Done!", text: "Project initialized successfully." } }
    ]
  },
  {
    id: "checkout",
    name: "Checkout Flow",
    description: "Applies promo code and proceeds to checkout",
    code: `[
  click("#pg-promo-code", { caption: "Apply discount code" }),
  type("#pg-promo-code", "DEMOGHOST50", { speed: "fast" }),
  click("#pg-apply-promo"),
  wait(300),
  highlight("#pg-discount-badge", { style: "pulse", duration: 1200 }),
  click("#pg-checkout-btn", { caption: "Complete purchase" })
]`,
    steps: [
      { type: "click", target: "#pg-promo-code", caption: "Apply discount code" },
      { type: "type", target: "#pg-promo-code", value: "DEMOGHOST50", speed: "fast" },
      { type: "click", target: "#pg-apply-promo" },
      { type: "wait", duration: 300 },
      { type: "highlight", target: "#pg-discount-badge", style: "pulse", duration: 1200 },
      { type: "click", target: "#pg-checkout-btn", caption: "Complete purchase" }
    ]
  },
  {
    id: "login",
    name: "User Login",
    description: "Simulates user entering credentials and logging in",
    code: `[
  click("#pg-login-email", { caption: "Enter your email address" }),
  type("#pg-login-email", "developer@demoghost.dev", { speed: "human" }),
  click("#pg-login-pass", { caption: "Enter secure password" }),
  type("#pg-login-pass", "SuperSecret123!", { speed: "fast" }),
  check("#pg-remember-me"),
  click("#pg-login-submit", { caption: "Sign In" }),
  highlight("#pg-auth-success", { style: "glow", duration: 1500 })
]`,
    steps: [
      { type: "click", target: "#pg-login-email", caption: "Enter your email address" },
      { type: "type", target: "#pg-login-email", value: "developer@demoghost.dev", speed: "human" },
      { type: "click", target: "#pg-login-pass", caption: "Enter secure password" },
      { type: "type", target: "#pg-login-pass", value: "SuperSecret123!", speed: "fast" },
      { type: "check", target: "#pg-remember-me" },
      { type: "click", target: "#pg-login-submit", caption: "Sign In" },
      { type: "highlight", target: "#pg-auth-success", style: "glow", duration: 1500 }
    ]
  },
  {
    id: "search",
    name: "Search & Filter",
    description: "Filters data items live with keystroke interaction",
    code: `[
  click("#pg-search-input", { caption: "Search live database" }),
  type("#pg-search-input", "Analytics", { speed: "human" }),
  wait(200),
  click("#pg-search-submit"),
  highlight("#pg-search-results", { style: "outline", duration: 1200 })
]`,
    steps: [
      { type: "click", target: "#pg-search-input", caption: "Search live database" },
      { type: "type", target: "#pg-search-input", value: "Analytics", speed: "human" },
      { type: "wait", duration: 200 },
      { type: "click", target: "#pg-search-submit" },
      { type: "highlight", target: "#pg-search-results", style: "outline", duration: 1200 }
    ]
  },
  {
    id: "mobile",
    name: "Mobile Touch Demo",
    description: "Simulates mobile touch pointer tap and interaction",
    code: `[
  click("#pg-mobile-tab", { caption: "Tap on Mobile Tab with Touch Indicator" }),
  wait(300),
  click("#pg-mobile-action"),
  highlight("#pg-mobile-card", { style: "glow", duration: 1000 })
]`,
    steps: [
      {
        type: "click",
        target: "#pg-mobile-tab",
        caption: "Tap on Mobile Tab with Touch Indicator"
      },
      { type: "wait", duration: 300 },
      { type: "click", target: "#pg-mobile-action" },
      { type: "highlight", target: "#pg-mobile-card", style: "glow", duration: 1000 }
    ]
  }
];
