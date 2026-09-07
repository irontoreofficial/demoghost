import { DemoGhost, click, type, wait, highlight, caption, select } from "demoghost";
import { DOCS_SECTIONS } from "./content/docsData";
import { PLAYGROUND_PRESETS } from "./content/presets";
import "demoghost/css";
import "./styles/docs.css";

// 1. Theme Management
const themeBtn = document.getElementById("theme-toggle")!;
const themes = ["dark", "light", "glass"];
let currentThemeIdx = 0;

themeBtn.addEventListener("click", () => {
  currentThemeIdx = (currentThemeIdx + 1) % themes.length;
  const newTheme = themes[currentThemeIdx];
  document.documentElement.setAttribute("data-theme", newTheme);
  themeBtn.textContent = newTheme.toUpperCase();
});

// 2. Install Box Copy
const installBox = document.getElementById("install-cmd")!;
installBox.addEventListener("click", () => {
  navigator.clipboard.writeText("npm install demoghost");
  const orig = installBox.textContent;
  installBox.textContent = "Copied to clipboard!";
  setTimeout(() => {
    installBox.textContent = orig;
  }, 2000);
});

// 3. Documentation Navigator
const sidebarNav = document.getElementById("docs-nav")!;
const docsViewer = document.getElementById("docs-viewer")!;
const docsSearch = document.getElementById("docs-search-input") as HTMLInputElement;

let activeDocId = "intro";

function renderDocsNav(filterText = "") {
  sidebarNav.innerHTML = "";
  const categories: Record<string, typeof DOCS_SECTIONS> = {};

  DOCS_SECTIONS.filter(
    d =>
      !filterText ||
      d.title.toLowerCase().includes(filterText.toLowerCase()) ||
      d.content.toLowerCase().includes(filterText.toLowerCase())
  ).forEach(doc => {
    if (!categories[doc.category]) categories[doc.category] = [];
    categories[doc.category].push(doc);
  });

  for (const [cat, docs] of Object.entries(categories)) {
    const title = document.createElement("div");
    title.className = "docs-nav-group-title";
    title.textContent = cat;
    sidebarNav.appendChild(title);

    docs.forEach(doc => {
      const item = document.createElement("a");
      item.className = `docs-nav-item ${doc.id === activeDocId ? "active" : ""}`;
      item.textContent = doc.title;
      item.addEventListener("click", () => {
        activeDocId = doc.id;
        renderDocsNav(filterText);
        renderActiveDoc();
      });
      sidebarNav.appendChild(item);
    });
  }
}

function renderActiveDoc() {
  const doc = DOCS_SECTIONS.find(d => d.id === activeDocId) || DOCS_SECTIONS[0];
  docsViewer.innerHTML = `
    <div class="glass-pill" style="margin-bottom: 16px; color: var(--accent);">
      ${doc.category}
    </div>
    ${convertMarkdownToHtml(doc.content)}
  `;
}

function convertMarkdownToHtml(md: string): string {
  return md
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(
      /^> (.*$)/gim,
      "<blockquote style='border-left: 3px solid var(--accent); margin: 0; padding-left: 16px; opacity: 0.85;'>$1</blockquote>"
    )
    .replace(/```(.*?)\n([\s\S]*?)```/gm, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "<p></p>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

docsSearch.addEventListener("input", e => {
  renderDocsNav((e.target as HTMLInputElement).value);
});

// 4. Code Playground
const presetSelect = document.getElementById("preset-select") as HTMLSelectElement;
const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;
const runPlaygroundBtn = document.getElementById("btn-run-playground")!;

function loadPreset(presetId: string) {
  const preset = PLAYGROUND_PRESETS.find(p => p.id === presetId) || PLAYGROUND_PRESETS[0];
  codeEditor.value = preset.code;
}

presetSelect.addEventListener("change", () => {
  loadPreset(presetSelect.value);
});

// Mock UI interaction inside Sandbox
const pgNewProjectBtn = document.getElementById("pg-new-project-btn");
const pgModal = document.getElementById("pg-modal");
const pgProjectNameInput = document.getElementById("pg-project-name") as HTMLInputElement;
const pgProjectCatSelect = document.getElementById("pg-project-cat") as HTMLSelectElement;
const pgSubmitProjectBtn = document.getElementById("pg-submit-project");
const pgActiveProject = document.getElementById("pg-active-project");

pgNewProjectBtn?.addEventListener("click", () => {
  if (pgModal) pgModal.style.display = "block";
});

pgSubmitProjectBtn?.addEventListener("click", () => {
  if (pgActiveProject) {
    const val = pgProjectNameInput.value || "New Project";
    const cat = pgProjectCatSelect.value;
    pgActiveProject.innerHTML = `<strong>${val}</strong> (${cat}) — Initialized`;
  }
  if (pgModal) pgModal.style.display = "none";
});

runPlaygroundBtn.addEventListener("click", () => {
  const preset = PLAYGROUND_PRESETS.find(p => p.id === presetSelect.value) || PLAYGROUND_PRESETS[0];
  DemoGhost.play(preset.steps, {
    controls: true,
    theme: "glass"
  });
});

// 5. Recorder Playground
const btnStartRecord = document.getElementById("btn-start-record")!;
const btnStopRecord = document.getElementById("btn-stop-record")!;
const btnReplayRecord = document.getElementById("btn-replay-record")!;
const recordStatusText = document.getElementById("record-status-text")!;
const recordDot = document.getElementById("record-dot")!;
const recordedCodeArea = document.getElementById("recorded-code") as HTMLTextAreaElement;

let activeRecorder: any = null;
let lastRecordedScenario: any = null;

btnStartRecord.addEventListener("click", () => {
  activeRecorder = DemoGhost.record({
    maskPasswords: true,
    captureScroll: true
  });
  btnStartRecord.style.display = "none";
  btnStopRecord.style.display = "inline-flex";
  recordStatusText.textContent = "Recording Live... Click & type on the right!";
  recordDot.classList.add("pulsing");
});

btnStopRecord.addEventListener("click", () => {
  if (activeRecorder) {
    lastRecordedScenario = activeRecorder.stop();
    activeRecorder = null;
  }
  btnStartRecord.style.display = "inline-flex";
  btnStopRecord.style.display = "none";
  btnReplayRecord.removeAttribute("disabled");
  recordStatusText.textContent = "Recording finished! Check generated code below.";
  recordDot.classList.remove("pulsing");

  if (lastRecordedScenario) {
    recordedCodeArea.value = DemoGhost.toTypeScript(lastRecordedScenario);
  }
});

btnReplayRecord.addEventListener("click", () => {
  if (lastRecordedScenario) {
    DemoGhost.play(lastRecordedScenario, {
      controls: true,
      theme: "glass"
    });
  }
});

// 6. LIVE SELF-DEMO ("Watch DemoGhost")
const watchDemoBtn = document.getElementById("btn-watch-demoghost")!;

watchDemoBtn.addEventListener("click", () => {
  DemoGhost.play(
    [
      caption({
        title: "DemoGhost Autopilot",
        text: "Welcome! DemoGhost is now demonstrating this live website."
      }),
      wait(500),
      click("#nav-playground", { caption: "Navigating to Interactive Playground" }),
      wait(600),
      click("#preset-select", { caption: "Selecting 'Create Project' scenario preset" }),
      wait(300),
      click("#btn-run-playground", { caption: "Triggering the live sandbox autopilot" }),
      wait(500),
      click("#pg-new-project-btn"),
      type("#pg-project-name", "DemoGhost Autonomous Cloud", { speed: "human" }),
      select("#pg-project-cat", "ai"),
      click("#pg-submit-project"),
      wait(300),
      highlight("#pg-active-project", { duration: 1500, style: "glow" }),
      caption({
        title: "Self-Demo Completed!",
        text: "Turn your own UI into an interactive demo in minutes with DemoGhost."
      })
    ],
    {
      theme: "glass",
      controls: true
    }
  );
});

// Initial Setup
loadPreset("create-project");
renderDocsNav();
renderActiveDoc();
