import type { DemoScenario, DemoStep } from "@demoghost/core";
import { SelectorGenerator, SelectorOptions } from "../selector/SelectorGenerator";
import { PrivacyMasker, PrivacyOptions } from "../privacy/PrivacyMasker";

export interface RecorderOptions {
  selector?: SelectorOptions;
  privacy?: PrivacyOptions;
  maskPasswords?: boolean;
  maskSelectors?: string[];
  ignoreSelectors?: string[];
  captureScroll?: boolean;
  captureKeyboard?: boolean;
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
  private keydownListener: any = null;

  constructor(options: RecorderOptions = {}) {
    this.options = {
      captureScroll: true,
      captureKeyboard: true,
      minWaitDuration: 600,
      ...options
    };
    this.selectorGen = new SelectorGenerator(options.selector);
    this.privacyMasker = new PrivacyMasker({
      ...options.privacy,
      maskPasswords: options.maskPasswords ?? options.privacy?.maskPasswords,
      maskSelectors: options.maskSelectors ?? options.privacy?.maskSelectors,
      ignoreSelectors: options.ignoreSelectors ?? options.privacy?.ignoreSelectors
    });
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
    this.keydownListener = (e: KeyboardEvent) => this.handleKeydown(e);

    document.addEventListener("click", this.clickListener, true);
    document.addEventListener("input", this.inputListener, true);
    document.addEventListener("change", this.changeListener, true);
    if (this.options.captureKeyboard) {
      document.addEventListener("keydown", this.keydownListener, true);
    }

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
    if (this.keydownListener) document.removeEventListener("keydown", this.keydownListener, true);
    if (this.scrollListener) window.removeEventListener("scroll", this.scrollListener);
    this.clickListener = null;
    this.inputListener = null;
    this.changeListener = null;
    this.keydownListener = null;
    this.scrollListener = null;
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
      tag === "select" ||
      tag === "textarea" ||
      (tag === "input" &&
        !["button", "submit", "reset", "image"].includes(
          (target as HTMLInputElement).type.toLowerCase()
        ))
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
    if (!this.isTextEntryElement(target)) return;

    if (this.activeInputElement !== target) {
      this.flushActiveInput();
      this.activeInputElement = target;
    }

    this.activeInputValue = this.privacyMasker.isSensitive(target)
      ? this.privacyMasker.maskValue(target, "")
      : target.value;

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
        value: maskedVal,
        clearFirst: true
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

  private handleKeydown(e: KeyboardEvent): void {
    if (e.repeat || e.isComposing) return;
    const target = e.target as HTMLElement;
    if (!target || this.privacyMasker.shouldIgnore(target)) return;

    const keys = new Set([
      "Enter",
      "Escape",
      "Tab",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "PageUp",
      "PageDown"
    ]);
    if (!keys.has(e.key)) return;

    this.flushActiveInput();
    const selector = target === document.body ? undefined : this.selectorGen.generate(target);
    this.appendWaitIfNecessary();
    this.steps.push({
      type: "press",
      key: e.key,
      ...(selector ? { target: selector } : {})
    });
  }

  private isTextEntryElement(
    element: HTMLElement
  ): element is HTMLInputElement | HTMLTextAreaElement {
    if (element instanceof HTMLTextAreaElement) return true;
    if (!(element instanceof HTMLInputElement)) return false;
    return ![
      "button",
      "checkbox",
      "color",
      "file",
      "hidden",
      "image",
      "radio",
      "range",
      "reset",
      "submit"
    ].includes(element.type.toLowerCase());
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
