import { ActionRegistry } from "./ActionRegistry";
import {
  ActionExecutionContext,
  MoveStep,
  ClickStep,
  DoubleClickStep,
  RightClickStep,
  TypeStep,
  ClearStep,
  FocusStep,
  BlurStep,
  WaitStep,
  ScrollStep,
  ScrollToStep,
  SelectStep,
  CheckStep,
  UncheckStep,
  HoverStep,
  PressStep,
  HighlightStep,
  CaptionStep,
  DragStep,
  TypingSpeed
} from "../types";
import { DemoGhostTimeoutError } from "../errors";

function getElementCenter(el: HTMLElement): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return {
    x: Math.round(rect.left + rect.width / 2),
    y: Math.round(rect.top + rect.height / 2)
  };
}

function isInteractive(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (
    tag === "button" ||
    tag === "a" ||
    tag === "input" ||
    tag === "select" ||
    tag === "textarea"
  ) {
    return true;
  }
  const role = el.getAttribute("role");
  if (role === "button" || role === "link" || role === "checkbox" || role === "menuitem") {
    return true;
  }
  return el.hasAttribute("onclick") || window.getComputedStyle(el).cursor === "pointer";
}

function calculateKeystrokeDelay(speed: TypingSpeed = "normal", deterministic = false): number {
  if (typeof speed === "number") return speed;
  switch (speed) {
    case "instant":
      return 0;
    case "fast":
      return 30;
    case "slow":
      return 180;
    case "human": {
      if (deterministic) return 85;
      // Natural human variance: 40ms to 140ms
      return Math.floor(40 + Math.random() * 100);
    }
    case "normal":
    default:
      return 75;
  }
}

function setNativeProperty(
  element: HTMLElement,
  property: "value" | "checked",
  value: unknown
): void {
  let prototype = Object.getPrototypeOf(element);
  while (prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
    if (descriptor?.set) {
      descriptor.set.call(element, value);
      return;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  (element as any)[property] = value;
}

function dispatchValueEvents(element: HTMLElement, includeChange = false): void {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  if (includeChange) element.dispatchEvent(new Event("change", { bubbles: true }));
}

async function waitForDuration(
  ctx: ActionExecutionContext,
  duration: number,
  scaleWithPlayback = true
): Promise<void> {
  const playbackSpeed = scaleWithPlayback ? Math.max(0.1, Number(ctx.options.speed) || 1) : 1;
  let remaining = Math.max(0, duration / playbackSpeed);

  while (remaining > 0 && !ctx.signal.aborted) {
    await ctx.waitIfPaused();
    if (ctx.signal.aborted) return;

    const slice = Math.min(remaining, 50);
    const startedAt = performance.now();
    await new Promise<void>(resolve => {
      const onAbort = () => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        ctx.signal.removeEventListener("abort", onAbort);
        resolve();
      }, slice);
      ctx.signal.addEventListener("abort", onAbort, { once: true });
    });
    remaining -= performance.now() - startedAt;
  }
}

export function registerBuiltinActions(registry: ActionRegistry): void {
  // MOVE
  registry.register("move", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as MoveStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    ctx.cursor.setState(isInteractive(el) ? "pointer" : "default");
    await ctx.cursor.moveTo(
      targetPos.x,
      targetPos.y,
      (step.duration ?? 500) / Math.max(0.1, Number(ctx.options.speed) || 1)
    );
  });

  // CLICK
  registry.register("click", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as ClickStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    ctx.cursor.setState(isInteractive(el) ? "pointer" : "default");
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 450);
    if (ctx.signal.aborted) return;

    await ctx.cursor.click(step.button ?? "left");
    if (ctx.signal.aborted) return;

    // Dispatch DOM events
    el.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window })
    );
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    if ((step.button ?? "left") === "left") {
      el.click();
    } else {
      el.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, view: window, button: 1 })
      );
    }

    if (typeof el.focus === "function") {
      el.focus();
    }
  });

  // DOUBLE CLICK
  registry.register("doubleClick", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as DoubleClickStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    ctx.cursor.setState(isInteractive(el) ? "pointer" : "default");
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 450);

    await ctx.cursor.doubleClick();
    if (ctx.signal.aborted) return;
    el.click();
    el.click();
    el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));
  });

  // RIGHT CLICK
  registry.register("rightClick", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as RightClickStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 450);
    await ctx.cursor.click("right");
    if (ctx.signal.aborted) return;

    el.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true, view: window })
    );
  });

  // TYPE
  registry.register("type", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as TypeStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    ctx.cursor.setState("text");
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 450);
    await ctx.cursor.click();
    if (ctx.signal.aborted) return;

    if (typeof el.focus === "function") {
      el.focus();
    }

    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    if (step.clearFirst && "value" in inputEl) {
      setNativeProperty(inputEl, "value", "");
      dispatchValueEvents(inputEl);
    }

    const text = String(step.value || "");
    const speed = step.speed ?? ctx.options.typingSpeed ?? "human";
    const deterministic = ctx.options.deterministic ?? false;

    for (let i = 0; i < text.length; i++) {
      await ctx.waitIfPaused();
      if (ctx.signal.aborted) return;
      const char = text[i];

      el.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true }));

      if ("value" in inputEl) {
        setNativeProperty(inputEl, "value", inputEl.value + char);
        dispatchValueEvents(inputEl);
      }

      el.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));

      const delay = calculateKeystrokeDelay(speed as TypingSpeed, deterministic);
      if (delay > 0) {
        await waitForDuration(ctx, delay);
      }
    }

    if ("value" in inputEl) {
      inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  // CLEAR
  registry.register("clear", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as ClearStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;

    if ("value" in inputEl) {
      setNativeProperty(inputEl, "value", "");
      dispatchValueEvents(inputEl, true);
    }
  });

  // FOCUS
  registry.register("focus", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as FocusStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);
    if (typeof el.focus === "function") {
      el.focus();
    }
  });

  // BLUR
  registry.register("blur", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as BlurStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    if (typeof el.blur === "function") {
      el.blur();
    }
  });

  // WAIT
  registry.register("wait", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as WaitStep;

    if (step.duration) {
      await waitForDuration(ctx, step.duration);
      return;
    }

    if (typeof step.condition === "function") {
      const timeout = step.timeout ?? 5000;
      const start = Date.now();
      while (Date.now() - start < timeout) {
        await ctx.waitIfPaused();
        if (ctx.signal.aborted) return;
        const res = await step.condition();
        if (res) return;
        await waitForDuration(ctx, 50, false);
      }
      throw new DemoGhostTimeoutError("custom condition", timeout);
    }

    if (step.selector) {
      const timeout = step.timeout ?? 5000;
      const state = step.state ?? "visible";
      const start = Date.now();

      while (Date.now() - start < timeout) {
        await ctx.waitIfPaused();
        if (ctx.signal.aborted) return;
        const el = await ctx.targetResolver.resolveOptional(step.selector, ctx.signal);
        if (state === "attached" && el) return;
        if (state === "detached" && !el) return;
        if (state === "visible" && el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) return;
        }
        if (state === "hidden" && (!el || el.offsetParent === null)) return;
        await waitForDuration(ctx, 50, false);
      }
      throw new DemoGhostTimeoutError(`selector "${step.selector}" state "${state}"`, timeout);
    }
  });

  // SCROLL
  registry.register("scroll", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as ScrollStep;
    if (step.target) {
      const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
      await ctx.scrollEngine.scrollIntoView(el, step.offset);
    } else if (typeof step.x === "number" || typeof step.y === "number") {
      const x = step.x ?? window.scrollX;
      const y = step.y ?? window.scrollY;
      await ctx.scrollEngine.scrollTo(x, y, step.behavior ?? "smooth");
    }
  });

  // SCROLL TO
  registry.register("scrollTo", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as ScrollToStep;
    await ctx.scrollEngine.scrollTo(step.x, step.y, step.behavior ?? "smooth");
  });

  // SELECT
  registry.register("select", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as SelectStep;
    const el = (await ctx.targetResolver.resolve(
      step.target,
      ctx.stepIndex,
      ctx.signal
    )) as HTMLSelectElement;
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 400);
    await ctx.cursor.click();

    if (el instanceof HTMLSelectElement) {
      const values = new Set(Array.isArray(step.value) ? step.value : [step.value]);
      if (el.multiple) {
        for (const option of Array.from(el.options)) option.selected = values.has(option.value);
      } else {
        setNativeProperty(el, "value", String(step.value));
      }
      dispatchValueEvents(el, true);
    }
  });

  // CHECK
  registry.register("check", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as CheckStep;
    const el = (await ctx.targetResolver.resolve(
      step.target,
      ctx.stepIndex,
      ctx.signal
    )) as HTMLInputElement;
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 400);
    await ctx.cursor.click();

    if ("checked" in el && !el.checked) {
      el.click();
      if (!el.checked) {
        setNativeProperty(el, "checked", true);
        dispatchValueEvents(el, true);
      }
    }
  });

  // UNCHECK
  registry.register("uncheck", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as UncheckStep;
    const el = (await ctx.targetResolver.resolve(
      step.target,
      ctx.stepIndex,
      ctx.signal
    )) as HTMLInputElement;
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 400);
    await ctx.cursor.click();

    if ("checked" in el && el.checked) {
      el.click();
      if (el.checked) {
        setNativeProperty(el, "checked", false);
        dispatchValueEvents(el, true);
      }
    }
  });

  // HOVER
  registry.register("hover", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as HoverStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    const targetPos = getElementCenter(el);
    ctx.cursor.setState(isInteractive(el) ? "pointer" : "default");
    await ctx.cursor.moveTo(targetPos.x, targetPos.y, 450);

    el.dispatchEvent(
      new MouseEvent("mouseenter", { bubbles: true, cancelable: true, view: window })
    );
    el.dispatchEvent(
      new MouseEvent("mouseover", { bubbles: true, cancelable: true, view: window })
    );

    if (step.duration && step.duration > 0) {
      await waitForDuration(ctx, step.duration);
    }
  });

  // PRESS
  registry.register("press", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as PressStep;
    let el = document.activeElement as HTMLElement;
    if (step.target) {
      el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
      if (typeof el.focus === "function") el.focus();
    }
    const targetEl = el || document.body;
    targetEl.dispatchEvent(new KeyboardEvent("keydown", { key: step.key, bubbles: true }));
    targetEl.dispatchEvent(new KeyboardEvent("keypress", { key: step.key, bubbles: true }));
    targetEl.dispatchEvent(new KeyboardEvent("keyup", { key: step.key, bubbles: true }));
  });

  // HIGHLIGHT
  registry.register("highlight", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as HighlightStep;
    const el = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);
    await ctx.scrollEngine.scrollIntoView(el);

    await ctx.spotlightEngine.highlight(el, {
      duration: step.duration ?? 1000,
      style: step.style ?? "glow"
    });
  });

  // CAPTION
  registry.register("caption", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as CaptionStep;
    let targetEl: HTMLElement | undefined;
    if (step.target) {
      targetEl = (await ctx.targetResolver.resolveOptional(step.target, ctx.signal)) || undefined;
    }
    ctx.spotlightEngine.showCaption(step.options, targetEl);
    if (step.options.duration) {
      await waitForDuration(ctx, step.options.duration);
      ctx.spotlightEngine.hideCaption();
    }
  });

  // DRAG
  registry.register("drag", async (ctx: ActionExecutionContext) => {
    const step = ctx.step as DragStep;
    const sourceEl = await ctx.targetResolver.resolve(step.source, ctx.stepIndex, ctx.signal);
    const targetEl = await ctx.targetResolver.resolve(step.target, ctx.stepIndex, ctx.signal);

    await ctx.scrollEngine.scrollIntoView(sourceEl);
    const sourcePos = getElementCenter(sourceEl);
    const targetPos = getElementCenter(targetEl);

    await ctx.cursor.moveTo(sourcePos.x, sourcePos.y, 400);
    ctx.cursor.setState("active");
    await ctx.cursor.click();

    sourceEl.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, clientX: sourcePos.x, clientY: sourcePos.y })
    );
    sourceEl.dispatchEvent(
      new DragEvent("dragstart", { bubbles: true, clientX: sourcePos.x, clientY: sourcePos.y })
    );

    await ctx.cursor.moveTo(targetPos.x, targetPos.y, step.duration ?? 700);

    targetEl.dispatchEvent(
      new DragEvent("dragover", { bubbles: true, clientX: targetPos.x, clientY: targetPos.y })
    );
    targetEl.dispatchEvent(
      new DragEvent("drop", { bubbles: true, clientX: targetPos.x, clientY: targetPos.y })
    );
    targetEl.dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true, clientX: targetPos.x, clientY: targetPos.y })
    );
    ctx.cursor.setState("default");
  });
}
