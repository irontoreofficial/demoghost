import { DemoTarget, TargetResolverInterface, TargetOptions } from "../types";
import { DemoGhostTargetNotFoundError } from "../errors";

export class TargetResolver implements TargetResolverInterface {
  private defaultTimeout: number;

  constructor(defaultTimeout = 5000) {
    this.defaultTimeout = defaultTimeout;
  }

  public async resolve(
    target: DemoTarget,
    stepIndex?: number,
    signal?: AbortSignal
  ): Promise<HTMLElement> {
    const el = await this.find(target, undefined, signal);
    if (el) return el;
    if (signal?.aborted) {
      throw new DOMException("Playback stopped", "AbortError");
    }

    const norm = this.normalizeTarget(target);
    const selector = norm.selector;
    const timeout = norm.timeout;
    throw new DemoGhostTargetNotFoundError(
      typeof selector === "string" ? selector : "<HTMLElement>",
      timeout,
      stepIndex
    );
  }

  public async resolveOptional(
    target: DemoTarget,
    signal?: AbortSignal
  ): Promise<HTMLElement | null> {
    try {
      return await this.find(target, 100, signal);
    } catch {
      return null;
    }
  }

  private normalizeTarget(target: DemoTarget): {
    selector: string | HTMLElement;
    timeout: number;
    offset?: { x?: number; y?: number };
  } {
    if (
      typeof target === "string" ||
      (typeof HTMLElement !== "undefined" && target instanceof HTMLElement)
    ) {
      return { selector: target, timeout: this.defaultTimeout };
    }
    const opts = target as TargetOptions;
    return {
      selector: opts.selector,
      timeout: opts.waitForTarget ?? opts.timeout ?? this.defaultTimeout,
      offset: opts.offset
    };
  }

  private async find(
    target: DemoTarget,
    customTimeout?: number,
    signal?: AbortSignal
  ): Promise<HTMLElement | null> {
    if (typeof window === "undefined" || !document) return null;

    const norm = this.normalizeTarget(target);
    const selector = norm.selector;
    const targetTimeout = norm.timeout;
    const timeout = customTimeout !== undefined ? customTimeout : targetTimeout;

    if (typeof HTMLElement !== "undefined" && selector instanceof HTMLElement) {
      return selector;
    }

    if (typeof selector !== "string") {
      return null;
    }

    const query = selector.trim();

    // Fast check: direct DOM query
    const direct = this.querySingle(query);
    if (direct) return direct;

    if (timeout <= 0 || signal?.aborted) return null;

    // Async waiting using MutationObserver with RAF fallback
    return new Promise<HTMLElement | null>(resolve => {
      let resolved = false;
      let timer: any = null;
      let observer: MutationObserver | null = null;
      let frame: number | null = null;

      const cleanup = () => {
        resolved = true;
        if (timer) clearTimeout(timer);
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (frame !== null && typeof cancelAnimationFrame !== "undefined") {
          cancelAnimationFrame(frame);
          frame = null;
        }
        signal?.removeEventListener("abort", onAbort);
      };

      const onAbort = () => {
        cleanup();
        resolve(null);
      };

      const check = () => {
        if (resolved) return;
        const match = this.querySingle(query);
        if (match) {
          cleanup();
          resolve(match);
        }
      };

      timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);

      if (typeof MutationObserver !== "undefined") {
        observer = new MutationObserver(() => {
          check();
        });
        observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }

      // Check once more in next animation frame
      if (typeof requestAnimationFrame !== "undefined") {
        frame = requestAnimationFrame(check);
      }

      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  public querySingle(selector: string): HTMLElement | null {
    if (
      selector.includes(":has-text(") ||
      selector.includes(":contains(") ||
      selector.startsWith("text=")
    ) {
      return this.queryByText(selector);
    }

    try {
      // Check for exact data-demoghost-id shorthand or attribute
      if (selector.startsWith("@")) {
        const id = selector.slice(1);
        const match = document.querySelector<HTMLElement>(
          `[data-demoghost-id="${CSS.escape(id)}"]`
        );
        if (match) return match;
      }

      // Standard CSS query
      const match = document.querySelector<HTMLElement>(selector);
      if (match) return match;

      // Fallback: Shadow DOM pierce traversal
      const shadowMatch = this.pierceShadow(document.body, selector);
      if (shadowMatch) return shadowMatch;
    } catch {
      // Fallback if selector has custom non-standard syntax
      if (selector.includes(":contains(") || selector.includes(":has-text(")) {
        return this.queryByText(selector);
      }
    }
    return null;
  }

  private queryByText(selector: string): HTMLElement | null {
    let baseSelector = "*";
    let text = "";
    let isExact = false;

    if (selector.startsWith("text=")) {
      text = selector.slice(5).trim();
      if (
        (text.startsWith('"') && text.endsWith('"')) ||
        (text.startsWith("'") && text.endsWith("'"))
      ) {
        text = text.slice(1, -1);
        isExact = true;
      }
    } else {
      const match = selector.match(/^(.*?):(has-text|contains)\(\s*(["']?)(.*?)\3\s*\)$/i);
      if (!match) return null;
      baseSelector = match[1].trim() || "*";
      const mode = match[2].toLowerCase();
      text = match[4].replace(/\\([\\"'])/g, "$1").trim();
      isExact = mode === "contains";
    }

    if (!text) return null;
    const lowerText = text.toLowerCase();

    try {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(baseSelector));
      const matching: HTMLElement[] = [];

      for (const el of candidates) {
        const content = (el.textContent || "").trim();
        if (isExact) {
          if (content.toLowerCase() === lowerText) {
            matching.push(el);
          }
        } else {
          if (content.toLowerCase().includes(lowerText)) {
            matching.push(el);
          }
        }
      }

      if (matching.length === 0) return null;

      // Crucial: Select the leaf-most (deepest) matching element in the DOM tree
      matching.sort((a, b) => {
        if (a.contains(b)) return 1; // b is a descendant of a, so b is deeper
        if (b.contains(a)) return -1; // a is a descendant of b, so a is deeper
        return 0;
      });

      return matching[0] || null;
    } catch {
      return null;
    }
  }

  private pierceShadow(root: ParentNode | null, selector: string): HTMLElement | null {
    if (!root) return null;

    try {
      const match = root.querySelector<HTMLElement>(selector);
      if (match) return match;
    } catch {
      // ignore
    }

    const children = Array.from(root.children || []);
    for (const child of children) {
      if ((child as HTMLElement).shadowRoot) {
        const found = this.pierceShadow((child as HTMLElement).shadowRoot, selector);
        if (found) return found;
      }
      const foundInChild = this.pierceShadow(child, selector);
      if (foundInChild) return foundInChild;
    }

    return null;
  }
}
