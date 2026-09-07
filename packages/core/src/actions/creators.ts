import {
  DemoTarget,
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
  CaptionOptions,
  DragStep
} from "../types";

export function move(target: DemoTarget, options: Partial<MoveStep> = {}): MoveStep {
  return { type: "move", target, ...options };
}

export function click(target: DemoTarget, options: Partial<ClickStep> = {}): ClickStep {
  return { type: "click", target, ...options };
}

export function doubleClick(
  target: DemoTarget,
  options: Partial<DoubleClickStep> = {}
): DoubleClickStep {
  return { type: "doubleClick", target, ...options };
}

export function rightClick(
  target: DemoTarget,
  options: Partial<RightClickStep> = {}
): RightClickStep {
  return { type: "rightClick", target, ...options };
}

export function type(target: DemoTarget, value: string, options: Partial<TypeStep> = {}): TypeStep {
  return { type: "type", target, value, ...options };
}

export function clear(target: DemoTarget, options: Partial<ClearStep> = {}): ClearStep {
  return { type: "clear", target, ...options };
}

export function focus(target: DemoTarget, options: Partial<FocusStep> = {}): FocusStep {
  return { type: "focus", target, ...options };
}

export function blur(target: DemoTarget, options: Partial<BlurStep> = {}): BlurStep {
  return { type: "blur", target, ...options };
}

export function wait(
  durationOrCondition: number | (() => boolean | Promise<boolean>),
  options: Partial<WaitStep> = {}
): WaitStep {
  if (typeof durationOrCondition === "number") {
    return { type: "wait", duration: durationOrCondition, ...options };
  }
  return { type: "wait", condition: durationOrCondition, ...options };
}

export function waitFor(
  targetOrSelectorOrCondition:
    | string
    | (() => boolean | Promise<boolean>)
    | {
        selector: string;
        state?: "visible" | "hidden" | "attached" | "detached";
        timeout?: number;
      },
  options: Partial<WaitStep> = {}
): WaitStep {
  if (typeof targetOrSelectorOrCondition === "string") {
    return { type: "wait", selector: targetOrSelectorOrCondition, state: "visible", ...options };
  }
  if (typeof targetOrSelectorOrCondition === "function") {
    return { type: "wait", condition: targetOrSelectorOrCondition, ...options };
  }
  return {
    type: "wait",
    selector: targetOrSelectorOrCondition.selector,
    state: targetOrSelectorOrCondition.state ?? "visible",
    timeout: targetOrSelectorOrCondition.timeout,
    ...options
  };
}

export function scroll(
  targetOrOptions?: DemoTarget | Partial<ScrollStep>,
  options: Partial<ScrollStep> = {}
): ScrollStep {
  if (
    typeof targetOrOptions === "string" ||
    (targetOrOptions && "tagName" in (targetOrOptions as any))
  ) {
    return { type: "scroll", target: targetOrOptions as DemoTarget, ...options };
  }
  if (targetOrOptions && typeof targetOrOptions === "object" && !("type" in targetOrOptions)) {
    return { type: "scroll", ...(targetOrOptions as Partial<ScrollStep>) };
  }
  return { type: "scroll", ...options };
}

export function scrollTo(x: number, y: number, behavior: ScrollBehavior = "smooth"): ScrollToStep {
  return { type: "scrollTo", x, y, behavior };
}

export function select(
  target: DemoTarget,
  value: string | string[],
  options: Partial<SelectStep> = {}
): SelectStep {
  return { type: "select", target, value, ...options };
}

export function check(target: DemoTarget, options: Partial<CheckStep> = {}): CheckStep {
  return { type: "check", target, ...options };
}

export function uncheck(target: DemoTarget, options: Partial<UncheckStep> = {}): UncheckStep {
  return { type: "uncheck", target, ...options };
}

export function hover(
  target: DemoTarget,
  duration = 500,
  options: Partial<HoverStep> = {}
): HoverStep {
  return { type: "hover", target, duration, ...options };
}

export function press(key: string, options: Partial<PressStep> = {}): PressStep {
  return { type: "press", key, ...options };
}

export function highlight(target: DemoTarget, options: Partial<HighlightStep> = {}): HighlightStep {
  return { type: "highlight", target, ...options };
}

export function caption(textOrOptions: string | CaptionOptions, target?: DemoTarget): CaptionStep {
  const options: CaptionOptions =
    typeof textOrOptions === "string" ? { text: textOrOptions } : textOrOptions;
  return { type: "caption", options, target };
}

export function drag(
  source: DemoTarget,
  target: DemoTarget,
  options: Partial<DragStep> = {}
): DragStep {
  return { type: "drag", source, target, ...options };
}
