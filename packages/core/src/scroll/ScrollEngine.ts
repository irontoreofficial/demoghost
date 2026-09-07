import { ScrollEngineInterface, ScrollConfig } from "../types";

export class ScrollEngine implements ScrollEngineInterface {
  private config: ScrollConfig;
  private activeScroll: { interval: ReturnType<typeof setInterval>; resolve: () => void } | null =
    null;

  constructor(config: ScrollConfig = {}) {
    this.config = {
      behavior: "smooth",
      offset: 80,
      ...config
    };
  }

  public async scrollIntoView(element: HTMLElement, customOffset?: number): Promise<void> {
    if (typeof window === "undefined") return;

    const offset = customOffset ?? this.config.offset ?? 80;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    // Check if element is already comfortably visible
    const isVisibleY = rect.top >= offset && rect.bottom <= windowHeight - 20;
    const isVisibleX = rect.left >= 0 && rect.right <= windowWidth;

    if (isVisibleY && isVisibleX) {
      return;
    }

    const currentScrollY = window.scrollY || window.pageYOffset;
    const targetY = Math.max(0, currentScrollY + rect.top - offset);

    await this.scrollTo(window.scrollX || window.pageXOffset, targetY, this.config.behavior);
  }

  public async scrollTo(x: number, y: number, behavior: ScrollBehavior = "smooth"): Promise<void> {
    if (typeof window === "undefined") return;

    if (behavior === "instant") {
      window.scrollTo(x, y);
      return;
    }

    this.finishActiveScroll();

    // Measure start and wait for smooth scroll to finish or timeout
    const startY = window.scrollY;
    const startX = window.scrollX;
    const diff = Math.hypot(x - startX, y - startY);

    if (diff < 5) return;

    window.scrollTo({ left: x, top: y, behavior: "smooth" });

    // Wait until scrolling stops
    return new Promise<void>(resolve => {
      let lastY = window.scrollY;
      let lastX = window.scrollX;
      let checkCount = 0;
      const maxChecks = 25; // max ~500ms

      const interval = setInterval(() => {
        const currY = window.scrollY;
        const currX = window.scrollX;
        checkCount++;

        // If scroll position hasn't changed or reached target or max checks
        if ((currY === lastY && currX === lastX && checkCount > 2) || checkCount >= maxChecks) {
          this.finishActiveScroll();
        } else {
          lastY = currY;
          lastX = currX;
        }
      }, 30);
      this.activeScroll = { interval, resolve };
    });
  }

  private finishActiveScroll(): void {
    if (!this.activeScroll) return;
    clearInterval(this.activeScroll.interval);
    const resolve = this.activeScroll.resolve;
    this.activeScroll = null;
    resolve();
  }

  public destroy(): void {
    this.finishActiveScroll();
  }
}
