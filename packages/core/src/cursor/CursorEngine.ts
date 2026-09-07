import { CursorEngineInterface, CursorConfig, PointerMode } from "../types";
import {
  Point,
  cubicBezierPoint,
  generateNaturalTrajectory,
  naturalHumanEase
} from "../animation/bezier";

export class CursorEngine implements CursorEngineInterface {
  private element: HTMLElement | null = null;
  private pointerMode: PointerMode;
  private config: CursorConfig;
  private position: Point = { x: 100, y: 100 };
  private activeAnimation: number | null = null;
  private activeAnimationResolve: (() => void) | null = null;
  private pendingTimers = new Map<ReturnType<typeof setTimeout>, () => void>();
  private ripples = new Set<HTMLElement>();
  private container: HTMLElement;
  private deterministic: boolean;
  private prefersReducedMotion = false;

  constructor(
    options: {
      pointerMode?: PointerMode;
      cursor?: CursorConfig;
      container?: HTMLElement;
      deterministic?: boolean;
    } = {}
  ) {
    this.pointerMode = options.pointerMode ?? "cursor";
    this.config = options.cursor ?? { style: "classic" };
    this.container =
      options.container ?? (typeof document !== "undefined" ? document.body : (null as any));
    this.deterministic = options.deterministic ?? false;

    if (typeof window !== "undefined" && window.matchMedia) {
      this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    this.mount();
  }

  private mount(): void {
    if (typeof document === "undefined" || !this.container) return;

    this.element = document.createElement("div");
    this.element.className = `dg-cursor dg-cursor--${this.pointerMode}`;
    this.element.setAttribute("aria-hidden", "true");
    this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;

    this.renderCursorGraphic();
    this.container.appendChild(this.element);
  }

  private renderCursorGraphic(): void {
    if (!this.element) return;

    if (this.config.customElement) {
      this.element.innerHTML = "";
      this.element.appendChild(this.config.customElement.cloneNode(true));
      return;
    }

    if (this.config.customSvg) {
      this.element.innerHTML = this.config.customSvg;
      return;
    }

    if (this.pointerMode === "touch") {
      this.element.innerHTML = `
        <div class="dg-touch-orb">
          <div class="dg-touch-inner"></div>
        </div>
      `;
      return;
    }

    // Default desktop cursor styles
    const style = this.config.style ?? "classic";
    switch (style) {
      case "dot":
        this.element.innerHTML = `<div class="dg-cursor-dot"></div>`;
        break;
      case "minimal":
        this.element.innerHTML = `
          <svg class="dg-cursor-svg dg-cursor-minimal" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="6" fill="var(--demoghost-accent, #6366f1)" />
            <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2" />
          </svg>
        `;
        break;
      case "pointer":
        this.element.innerHTML = `
          <svg class="dg-cursor-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 11V4a2 2 0 0 1 4 0v5M11 9V6a2 2 0 0 1 4 0v3M15 9V7a2 2 0 0 1 4 0v7a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3a2 2 0 0 1 4 0v2" fill="var(--demoghost-cursor, #0f172a)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        break;
      case "classic":
        this.element.innerHTML = `
          <svg class="dg-cursor-svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" 
              fill="var(--demoghost-cursor, #0f172a)" 
              stroke="white" 
              stroke-width="1.5" 
              stroke-linejoin="round"/>
          </svg>
        `;
        break;
      default:
        this.element.innerHTML = `
          <svg class="dg-cursor-svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" 
              fill="var(--demoghost-cursor, #0f172a)" 
              stroke="white" 
              stroke-width="1.5" 
              stroke-linejoin="round"/>
          </svg>
        `;
        break;
    }
  }

  public async moveTo(x: number, y: number, duration = 600): Promise<void> {
    this.finishActiveAnimation();

    const start = { ...this.position };
    const end = { x, y };

    if (this.prefersReducedMotion || duration <= 0) {
      this.updatePosition(end);
      return;
    }

    const trajectory = generateNaturalTrajectory(start, end, this.deterministic);
    const cp1 = trajectory[0];
    const cp2 = trajectory[1];

    return new Promise<void>(resolve => {
      this.activeAnimationResolve = resolve;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const t = naturalHumanEase(progress);

        const currentPoint = cubicBezierPoint(start, cp1, cp2, end, t);
        this.updatePosition(currentPoint);

        if (progress < 1) {
          this.activeAnimation = requestAnimationFrame(step);
        } else {
          this.updatePosition(end);
          this.activeAnimation = null;
          this.activeAnimationResolve = null;
          resolve();
        }
      };

      this.activeAnimation = requestAnimationFrame(step);
    });
  }

  public async click(_button = "left"): Promise<void> {
    if (!this.element) return;

    this.element.classList.add("dg-cursor--active");
    this.createRipple();

    await this.wait(120);
    if (this.element) {
      this.element.classList.remove("dg-cursor--active");
    }
  }

  public async doubleClick(): Promise<void> {
    await this.click();
    await this.wait(80);
    await this.click();
  }

  private createRipple(): void {
    if (typeof document === "undefined" || !this.container) return;

    const ripple = document.createElement("div");
    ripple.className = "dg-click-ripple";
    ripple.style.left = `${this.position.x}px`;
    ripple.style.top = `${this.position.y}px`;
    this.container.appendChild(ripple);
    this.ripples.add(ripple);

    this.schedule(600, () => this.removeRipple(ripple));
  }

  private wait(duration: number): Promise<void> {
    return new Promise(resolve => this.schedule(duration, resolve));
  }

  private schedule(duration: number, callback: () => void): void {
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);
      callback();
    }, duration);
    this.pendingTimers.set(timer, callback);
  }

  private removeRipple(ripple: HTMLElement): void {
    ripple.remove();
    this.ripples.delete(ripple);
  }

  private finishActiveAnimation(): void {
    if (this.activeAnimation !== null) {
      cancelAnimationFrame(this.activeAnimation);
      this.activeAnimation = null;
    }
    if (this.activeAnimationResolve) {
      const resolve = this.activeAnimationResolve;
      this.activeAnimationResolve = null;
      resolve();
    }
  }

  public show(): void {
    if (this.element) {
      this.element.style.opacity = "1";
      this.element.style.pointerEvents = "none";
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.style.opacity = "0";
    }
  }

  public setState(state: "default" | "pointer" | "text" | "active" | "hidden"): void {
    if (!this.element) return;
    this.element.classList.remove(
      "dg-state-pointer",
      "dg-state-text",
      "dg-state-active",
      "dg-state-hidden"
    );
    if (state !== "default") {
      this.element.classList.add(`dg-state-${state}`);
    }
  }

  public getPosition(): Point {
    return { ...this.position };
  }

  private updatePosition(pt: Point): void {
    this.position = pt;
    if (this.element) {
      this.element.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
    }
  }

  public destroy(): void {
    this.finishActiveAnimation();
    this.pendingTimers.forEach((callback, timer) => {
      clearTimeout(timer);
      callback();
    });
    this.pendingTimers.clear();
    for (const ripple of this.ripples) this.removeRipple(ripple);
    this.ripples.clear();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}
