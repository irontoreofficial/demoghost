export class AccessibilityManager {
  private liveRegion: HTMLElement | null = null;
  private previousActiveElement: HTMLElement | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private announcementTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initLiveRegion();
  }

  private initLiveRegion(): void {
    if (typeof document === "undefined") return;

    this.liveRegion = document.createElement("div");
    this.liveRegion.className = "dg-sr-only";
    this.liveRegion.setAttribute("role", "status");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    document.body.appendChild(this.liveRegion);
  }

  public saveFocus(): void {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      this.previousActiveElement = document.activeElement;
    }
  }

  public restoreFocus(): void {
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === "function") {
      try {
        this.previousActiveElement.focus();
      } catch {
        // Element might be detached
      }
      this.previousActiveElement = null;
    }
  }

  public announce(message: string): void {
    if (!this.liveRegion) return;
    // Clear and set to trigger speech synthesis in screen readers
    this.liveRegion.textContent = "";
    if (this.announcementTimer) clearTimeout(this.announcementTimer);
    this.announcementTimer = setTimeout(() => {
      this.announcementTimer = null;
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 50);
  }

  public bindKeyboardControls(options: { onStop: () => void; onTogglePause: () => void }): void {
    if (typeof window === "undefined") return;

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        options.onStop();
      }
    };

    window.addEventListener("keydown", this.keydownHandler);
  }

  public destroy(): void {
    if (this.announcementTimer) {
      clearTimeout(this.announcementTimer);
      this.announcementTimer = null;
    }
    if (this.keydownHandler && typeof window !== "undefined") {
      window.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }

    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
      this.liveRegion = null;
    }

    this.restoreFocus();
  }
}
