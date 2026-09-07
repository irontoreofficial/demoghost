import type { DemoScenario, DemoStep } from "@demoghost/core";
import { SelectorGenerator, SelectorOptions } from "../selector/SelectorGenerator";
import { PrivacyMasker, PrivacyOptions } from "../privacy/PrivacyMasker";

export interface RecorderOptions {
  selector?: SelectorOptions;
  privacy?: PrivacyOptions;
  captureScroll?: boolean;
  minWaitDuration?: number;
}

export class EventRecorder {
  private options: RecorderOptions;
  private selectorGen: SelectorGenerator;
  private privacyMasker: PrivacyMasker;

  private steps: DemoStep[] = [];
  private isRecording = false;
  private lastActionTime = 0;
  private activeInputTimer: any = null;
  private activeInputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
  private activeInputValue = "";

  private clickListener: any = null;
  private inputListener: any = null;
  private changeListener: any = null;
  private scrollListener: any = null;

  constructor(options: RecorderOptions = {}) {
    this.options = {
      captureScroll: true,
      minWaitDuration: 600,
      ...options
    };
    this.selectorGen = new SelectorGenerator(options.selector);
    this.privacyMasker = new PrivacyMasker(options.privacy);
  }

  public start(): void {
    if (typeof window === "undefined" || this.isRecording) return;

    this.steps = [];
    this.isRecording = true;
    this.lastActionTime = Date.now();

    this.bindEvents();
  }

  public stop(): DemoScenario {
    if (!this.isRecording) {
      return { steps: this.steps };
    }

    this.flushActiveInput();
    this.unbindEvents();
    this.isRecording = false;

    return {
      version: 1,
      steps: [...this.steps]
    };
  }

  private bindEvents(): void {
    this.clickListener = (e: MouseEvent) => this.handleClick(e);
    this.inputListener = (e: Event) => this.handleInput(e);
    this.changeListener = (e: Event) => this.handleChange(e);

    document.addEventListener("click", this.clickListener, true);
    document.addEventListener("input", this.inputListener, true);
    document.addEventListener("change", this.changeListener, true);

    if (this.options.captureScroll) {
      this.scrollListener = () => this.handleScroll();
      window.addEventListener("scroll", this.scrollListener, { passive: true });
    }
  }

  private unbindEvents(): void {
    if (typeof document === "undefined") return;

    if (this.clickListener) document.removeEventListener("click", this.clickListener, true);
    if (this.inputListener) document.removeEventListener("input", this.inputListener, true);
    if (this.changeListener) document.removeEventListener("change", this.changeListener, true);
    if (this.scrollListener) window.removeEventListener("scroll", this.scrollListener);
  }

  private appendWaitIfNecessary(): void {
    const now = Date.now();
    const elapsed = now - this.lastActionTime;
    const minWait = this.options.minWaitDuration ?? 600;

    if (this.steps.length > 0 && elapsed >= minWait) {
      // Round to nearest 100ms
      const waitTime = Math.round(elapsed / 100) * 100;
      this.steps.push({ type: "wait", duration: waitTime });
    }
    this.lastActionTime = now;
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target || this.privacyMasker.shouldIgnore(target)) return;

    // Flush any pending typing before recording click
    this.flushActiveInput();

    const tag = target.tagName.toLowerCase();
    // Don't record click on inputs that will be handled by typing/change
    if (
      tag === "input" &&
      (target as HTMLInputElement).type !== "button" &&
      (target as HTMLInputElement).type !== "submit"
    ) {
      return;
    }

    const selector = this.selectorGen.generate(target);
    if (!selector) return;

    this.appendWaitIfNecessary();
    this.steps.push({
      type: "click",
      target: selector
    });
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (!target || this.privacyMasker.shouldIgnore(target)) return;

    if (this.activeInputElement !== target) {
      this.flushActiveInput();
      this.activeInputElement = target;
    }

    this.activeInputValue = target.value;

    if (this.activeInputTimer) {
      clearTimeout(this.activeInputTimer);
    }

    // Debounce typing end: 500ms
    this.activeInputTimer = setTimeout(() => {
      this.flushActiveInput();
    }, 500);
  }

  private flushActiveInput(): void {
    if (this.activeInputTimer) {
      clearTimeout(this.activeInputTimer);
      this.activeInputTimer = null;
    }

    if (!this.activeInputElement) return;

    const el = this.activeInputElement;
    const selector = this.selectorGen.generate(el);

    if (selector) {
      const maskedVal = this.privacyMasker.maskValue(el, this.activeInputValue);
      this.appendWaitIfNecessary();
      this.steps.push({
        type: "type",
        target: selector,
        value: maskedVal
      });
    }

    this.activeInputElement = null;
    this.activeInputValue = "";
  }

  private handleChange(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target || this.privacyMasker.shouldIgnore(target)) return;

    this.flushActiveInput();

    const tag = target.tagName.toLowerCase();

    if (tag === "select") {
      const selectEl = target as HTMLSelectElement;
      const selector = this.selectorGen.generate(selectEl);
      if (selector) {
        this.appendWaitIfNecessary();
        this.steps.push({
          type: "select",
          target: selector,
          value: selectEl.value
        });
      }
    } else if (tag === "input") {
      const inputEl = target as HTMLInputElement;
      const type = (inputEl.type || "text").toLowerCase();

      if (type === "checkbox" || type === "radio") {
        const selector = this.selectorGen.generate(inputEl);
        if (selector) {
          this.appendWaitIfNecessary();
          this.steps.push({
            type: inputEl.checked ? "check" : "uncheck",
            target: selector
          });
        }
      }
    }
  }

  private handleScroll(): void {
    // Throttled scroll capture
    const now = Date.now();
    if (now - this.lastActionTime < 1000) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    if (scrollY > 0 || scrollX > 0) {
      this.steps.push({
        type: "scrollTo",
        x: scrollX,
        y: scrollY,
        behavior: "smooth"
      });
      this.lastActionTime = now;
    }
  }
}
