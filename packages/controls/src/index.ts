import type { PlaybackControllerInterface, PlaybackEvents } from "@demoghost/core";
import "./styles/controls.css";

export interface ControlsOptions {
  container?: HTMLElement;
  showStepBadge?: boolean;
  showProgress?: boolean;
  showSpeed?: boolean;
}

export class DemoGhostControls {
  private controller: PlaybackControllerInterface;
  private options: ControlsOptions;
  private rootElement: HTMLElement | null = null;
  private unsubs: Array<() => void> = [];

  constructor(controller: PlaybackControllerInterface, options: ControlsOptions = {}) {
    this.controller = controller;
    this.options = {
      showStepBadge: true,
      showProgress: true,
      showSpeed: true,
      ...options
    };

    this.mount();
    this.bindEvents();
  }

  private mount(): void {
    if (typeof document === "undefined") return;

    const container = this.options.container || document.body;

    this.rootElement = document.createElement("div");
    this.rootElement.className = "dg-controls-container";
    this.rootElement.setAttribute("role", "region");
    this.rootElement.setAttribute("aria-label", "Demo playback controls");

    this.render();
    container.appendChild(this.rootElement);
  }

  private render(): void {
    if (!this.rootElement) return;

    const total = this.controller.totalSteps;
    const current = Math.min(this.controller.currentStep + 1, total);
    const progressPct = total > 0 ? (current / total) * 100 : 0;
    const isPlaying = this.controller.state === "playing";

    this.rootElement.innerHTML = `
      <div class="dg-controls-hud dg-glass-panel">
        <div class="dg-controls-header">
          <div class="dg-controls-title" id="dg-controls-title">Interactive Demo</div>
          ${this.options.showStepBadge ? `<div class="dg-controls-step-badge" id="dg-controls-step">${current} / ${total}</div>` : ""}
        </div>
        ${
          this.options.showProgress
            ? `
          <div class="dg-controls-progress">
            <div class="dg-controls-progress-bar" id="dg-controls-bar" style="width: ${progressPct}%"></div>
          </div>
        `
            : ""
        }
        <div class="dg-controls-buttons">
          <button type="button" class="dg-btn" id="dg-btn-prev" aria-label="Previous step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="4"></line></svg>
          </button>
          <button type="button" class="dg-btn dg-btn--play" id="dg-btn-toggle" aria-label="${isPlaying ? "Pause" : "Play"}">
            ${
              isPlaying
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
            }
          </button>
          <button type="button" class="dg-btn" id="dg-btn-next" aria-label="Next step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
          <button type="button" class="dg-btn" id="dg-btn-restart" aria-label="Restart demo">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          ${
            this.options.showSpeed
              ? `
            <select class="dg-speed-select" id="dg-speed" aria-label="Playback speed">
              <option value="0.5">0.5x</option>
              <option value="1" selected>1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          `
              : ""
          }
          <button type="button" class="dg-btn" id="dg-btn-close" aria-label="Close demo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private attachListeners(): void {
    if (!this.rootElement) return;

    const prevBtn = this.rootElement.querySelector("#dg-btn-prev");
    const toggleBtn = this.rootElement.querySelector("#dg-btn-toggle");
    const nextBtn = this.rootElement.querySelector("#dg-btn-next");
    const restartBtn = this.rootElement.querySelector("#dg-btn-restart");
    const closeBtn = this.rootElement.querySelector("#dg-btn-close");
    const speedSel = this.rootElement.querySelector("#dg-speed") as HTMLSelectElement;

    prevBtn?.addEventListener("click", () => this.controller.previous());
    nextBtn?.addEventListener("click", () => this.controller.next());
    toggleBtn?.addEventListener("click", () => {
      if (this.controller.state === "playing") {
        this.controller.pause();
      } else if (this.controller.state === "paused") {
        this.controller.resume();
      } else if (this.controller.state === "idle") {
        void this.controller.play();
      } else {
        void this.controller.restart();
      }
    });
    restartBtn?.addEventListener("click", () => this.controller.restart());
    closeBtn?.addEventListener("click", () => this.controller.stop());

    speedSel?.addEventListener("change", () => {
      const spd = parseFloat(speedSel.value);
      this.controller.speed = spd;
    });
  }

  private bindEvents(): void {
    const onStep = (data: PlaybackEvents["step:start"]) => {
      const stepBadge = this.rootElement?.querySelector("#dg-controls-step");
      if (stepBadge) {
        stepBadge.textContent = `${data.index + 1} / ${data.total}`;
      }
      const progressBar = this.rootElement?.querySelector("#dg-controls-bar") as HTMLElement;
      if (progressBar) {
        const pct = ((data.index + 1) / data.total) * 100;
        progressBar.style.width = `${pct}%`;
      }
      const titleEl = this.rootElement?.querySelector("#dg-controls-title");
      if (titleEl) {
        const stepCaption =
          typeof data.step.caption === "string"
            ? data.step.caption
            : data.step.caption?.title || data.step.type;
        titleEl.textContent = stepCaption;
      }
    };

    const onStateChange = () => {
      const toggleBtn = this.rootElement?.querySelector("#dg-btn-toggle");
      if (!toggleBtn) return;
      const isPlaying = this.controller.state === "playing";
      toggleBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
      toggleBtn.innerHTML = isPlaying
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    };

    const onClose = () => {
      this.destroy(true);
    };

    this.unsubs.push(this.controller.on("start", onStateChange));
    this.unsubs.push(this.controller.on("step:start", onStep));
    this.unsubs.push(this.controller.on("pause", onStateChange));
    this.unsubs.push(this.controller.on("resume", onStateChange));
    this.unsubs.push(this.controller.on("complete", onClose));
    this.unsubs.push(this.controller.on("stop", onClose));
  }

  public destroy(immediate = false): void {
    this.unsubs.forEach(u => u());
    this.unsubs = [];

    if (this.rootElement && this.rootElement.parentNode) {
      if (immediate) {
        this.rootElement.parentNode.removeChild(this.rootElement);
        this.rootElement = null;
      } else {
        const el = this.rootElement;
        el.classList.add("dg-controls-container--hidden");
        setTimeout(() => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, 300);
        this.rootElement = null;
      }
    }
  }
}

export function attachControls(
  controller: PlaybackControllerInterface,
  options?: ControlsOptions
): DemoGhostControls {
  return new DemoGhostControls(controller, options);
}
