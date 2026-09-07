import { DemoTarget, TargetResolver as ITargetResolver, TargetOptions } from "../types";
import { DemoGhostTargetNotFoundError } from "../errors";

export class TargetResolver implements ITargetResolver {
  private defaultTimeout: number;

  constructor(defaultTimeout = 5000) {
    this.defaultTimeout = defaultTimeout;
  }

  public async resolve(target: DemoTarget, stepIndex?: number): Promise<HTMLElement> {
    const el = await this.find(target);
    if (el) return el;

    const { selector, timeout } = this.normalizeTarget(target);
    throw new DemoGhostTargetNotFoundError(
      typeof selector === "string" ? selector : "<HTMLElement>",
      timeout,
      stepIndex
    );
  }

  public async resolveOptional(target: DemoTarget): Promise<HTMLElement | null> {
    try {
      return await this.find(target, 100);
    } catch {
      return null;
    }
  }

  private normalizeTarget(target: DemoTarget): {
    selector: string | HTMLElement;
    timeout: number;
    offset?: { x?: number; y?: number };
  } {
    if (typeof target === "string" || target instanceof HTMLElement) {
      return { selector: target, timeout: this.defaultTimeout };
    }
    const opts = target as TargetOptions;
    return {
      selector: opts.selector,
      timeout: opts.waitForTarget ?? opts.timeout ?? this.defaultTimeout,
      offset: opts.offset
    };
  }

  private async find(target: DemoTarget, customTimeout?: number): Promise<HTMLElement | null> {
    if (typeof window === "undefined" || !document) return null;

    const { selector, timeout: targetTimeout } = this.normalizeTarget(target);
    const timeout = customTimeout ?? targetTimeout;

    if (selector instanceof HTMLElement) {
      return selector;
    }

    if (typeof selector !== "string") {
      return null;
    }

    const query = selector.trim();

    // Fast check: direct DOM query
    const direct = this.querySingle(query);
    if (direct) return direct;

    if (timeout <= 0) return null;

    // Async waiting using MutationObserver with RAF fallback
    return new Promise<HTMLElement | null>(resolve => {
      let resolved = false;
      let timer: any = null;
      let observer: MutationObserver | null = null;

      const cleanup = () => {
        resolved = true;
        if (timer) clearTimeout(timer);
        if (observer) {
          observer.disconnect();
          observer = null;
        }
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
        requestAnimationFrame(check);
      }
    });
  }

  private querySingle(selector: string): HTMLElement | null {
    try {
      // Check for exact data-demoghost-id shorthand or attribute
      if (selector.startsWith("@")) {
        const id = selector.slice(1);
        const match = document.querySelector<HTMLElement>(`[data-demoghost-id="${id}"]`);
        if (match) return match;
      }

      // Standard CSS query
      const match = document.querySelector<HTMLElement>(selector);
      if (match) return match;

      // Text search fallback if using :contains or text syntax
      if (selector.includes(":has-text(") || selector.includes(":contains(")) {
        return this.queryByText(selector);
      }
    } catch {
      // Invalid selector string or unsupported pseudo-class
    }
    return null;
  }

  private queryByText(selector: string): HTMLElement | null {
    const textMatch = selector.match(/:(?:has-text|contains)\(["']?(.*?)["']?\)/);
    if (!textMatch) return null;

    const baseSelector = selector.split(/:(?:has-text|contains)/)[0].trim() || "*";
    const text = textMatch[1].trim().toLowerCase();

    const candidates = Array.from(document.querySelectorAll<HTMLElement>(baseSelector));
    for (const el of candidates) {
      if (el.textContent && el.textContent.toLowerCase().includes(text)) {
        return el;
      }
    }
    return null;
  }
}
