import { SpotlightEngineInterface, CaptionOptions } from "../types";

export class SpotlightEngine implements SpotlightEngineInterface {
  private container: HTMLElement;
  private overlayEl: HTMLElement | null = null;
  private captionEl: HTMLElement | null = null;
  private activeElement: HTMLElement | null = null;
  private activeStyle: string | null = null;

  constructor(container?: HTMLElement) {
    this.container = container ?? (typeof document !== "undefined" ? document.body : (null as any));
  }

  public async highlight(
    element: HTMLElement,
    options: { duration?: number; style?: string; caption?: CaptionOptions | string } = {}
  ): Promise<void> {
    this.clearHighlight();

    this.activeElement = element;
    this.activeStyle = options.style ?? "glow";
    element.classList.add(`dg-highlight-${this.activeStyle}`);

    if (this.activeStyle === "spotlight") {
      this.renderSpotlightOverlay(element);
    }

    if (options.caption) {
      const captionOpts: CaptionOptions =
        typeof options.caption === "string" ? { text: options.caption } : options.caption;
      this.showCaption(captionOpts, element);
    }

    if (options.duration && options.duration > 0) {
      await new Promise(r => setTimeout(r, options.duration));
      this.clearHighlight();
    }
  }

  public clearHighlight(): void {
    if (this.activeElement && this.activeStyle) {
      this.activeElement.classList.remove(`dg-highlight-${this.activeStyle}`);
      this.activeElement = null;
      this.activeStyle = null;
    }

    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
      this.overlayEl = null;
    }

    this.hideCaption();
  }

  private renderSpotlightOverlay(element: HTMLElement): void {
    if (typeof document === "undefined" || !this.container) return;

    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "dg-spotlight-backdrop";
    this.overlayEl.setAttribute("aria-hidden", "true");

    const rect = element.getBoundingClientRect();
    const pad = 8;
    this.overlayEl.style.clipPath = `polygon(
      0% 0%, 0% 100%, 100% 100%, 100% 0%,
      0% 0%,
      ${rect.left - pad}px ${rect.top - pad}px,
      ${rect.right + pad}px ${rect.top - pad}px,
      ${rect.right + pad}px ${rect.bottom + pad}px,
      ${rect.left - pad}px ${rect.bottom + pad}px,
      ${rect.left - pad}px ${rect.top - pad}px
    )`;

    this.container.appendChild(this.overlayEl);
  }

  public showCaption(options: CaptionOptions, targetEl?: HTMLElement): void {
    this.hideCaption();
    if (typeof document === "undefined" || !this.container) return;

    this.captionEl = document.createElement("div");
    this.captionEl.className = "dg-caption dg-glass-panel";
    this.captionEl.setAttribute("role", "status");

    let innerHtml = "";
    if (options.title) {
      innerHtml += `<div class="dg-caption-title">${this.escapeHtml(options.title)}</div>`;
    }
    innerHtml += `<div class="dg-caption-text">${this.escapeHtml(options.text)}</div>`;
    this.captionEl.innerHTML = innerHtml;

    this.container.appendChild(this.captionEl);

    // Positioning
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const pos = options.position || "bottom";
      const offset = 16;

      let top = 0;
      let left = 0;

      if (pos === "top") {
        top = rect.top - this.captionEl.offsetHeight - offset;
        left = rect.left + rect.width / 2 - this.captionEl.offsetWidth / 2;
      } else if (pos === "left") {
        top = rect.top + rect.height / 2 - this.captionEl.offsetHeight / 2;
        left = rect.left - this.captionEl.offsetWidth - offset;
      } else if (pos === "right") {
        top = rect.top + rect.height / 2 - this.captionEl.offsetHeight / 2;
        left = rect.right + offset;
      } else {
        // Bottom or auto
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - this.captionEl.offsetWidth / 2;
      }

      // Clamp to viewport
      const pad = 12;
      left = Math.max(pad, Math.min(window.innerWidth - this.captionEl.offsetWidth - pad, left));
      top = Math.max(pad, Math.min(window.innerHeight - this.captionEl.offsetHeight - pad, top));

      this.captionEl.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    } else {
      // Centered at bottom of viewport
      this.captionEl.style.bottom = "80px";
      this.captionEl.style.left = "50%";
      this.captionEl.style.transform = "translateX(-50%)";
    }

    // Auto-fade in
    requestAnimationFrame(() => {
      if (this.captionEl) {
        this.captionEl.classList.add("dg-caption--visible");
      }
    });
  }

  public hideCaption(): void {
    if (this.captionEl && this.captionEl.parentNode) {
      this.captionEl.parentNode.removeChild(this.captionEl);
      this.captionEl = null;
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  public destroy(): void {
    this.clearHighlight();
  }
}
