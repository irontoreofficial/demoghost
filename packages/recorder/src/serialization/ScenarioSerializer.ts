import type { DemoScenario, DemoStep } from "@demoghostjs/core";

const BUILTIN_ACTIONS = new Set([
  "move",
  "click",
  "doubleClick",
  "rightClick",
  "type",
  "clear",
  "focus",
  "blur",
  "wait",
  "waitFor",
  "scroll",
  "scrollTo",
  "select",
  "check",
  "uncheck",
  "hover",
  "press",
  "highlight",
  "caption",
  "drag"
]);

export class ScenarioSerializer {
  public static serialize(scenario: DemoScenario): string {
    return JSON.stringify(
      scenario,
      (_key, value) => {
        if (typeof value === "function") {
          throw new TypeError(
            "Function-based steps cannot be serialized. Use waitFor(selector) instead."
          );
        }
        if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
          throw new TypeError(
            "HTMLElement targets cannot be serialized. Use a stable selector string."
          );
        }
        return value;
      },
      2
    );
  }

  public static deserialize(json: string): DemoScenario {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as any).steps)) {
        throw new Error("Invalid scenario JSON: 'steps' array is required.");
      }
      if (
        !(parsed as any).steps.every(
          (step: unknown) =>
            step !== null && typeof step === "object" && typeof (step as any).type === "string"
        )
      ) {
        throw new Error("Invalid scenario JSON: every step requires a string 'type'.");
      }
      return parsed as DemoScenario;
    } catch (err: any) {
      throw new Error(`Failed to deserialize DemoGhost scenario: ${err.message}`);
    }
  }

  public static toTypeScript(scenario: DemoScenario): string {
    const usedActions = new Set<string>();
    const stepLines = scenario.steps.map(step => {
      if (BUILTIN_ACTIONS.has(step.type)) {
        usedActions.add(step.type === "wait" && step.selector ? "waitFor" : step.type);
      }
      return this.formatStepCode(step);
    });
    const imports = Array.from(usedActions).sort().join(", ");
    const namedImports = imports ? `, ${imports}` : "";

    return `import { DemoGhost${namedImports} } from "demoghost";

export const scenario = [
  ${stepLines.join(",\n  ")}
];

await DemoGhost.play(scenario);
`;
  }

  public static toJavaScript(scenario: DemoScenario): string {
    const stepLines = scenario.steps.map(step => this.formatStepCode(step, "DemoGhost."));

    return `// DemoGhost Scenario Replay
const scenario = [
  ${stepLines.join(",\n  ")}
];

await DemoGhost.play(scenario);
`;
  }

  private static formatStepCode(step: DemoStep, prefix = ""): string {
    const target = () => this.formatValue((step as any).target);
    const options = (excluded: string[]) => this.formatOptions(step, excluded);
    const withOptions = (base: string, value: string) =>
      value ? `${base}, ${value})` : `${base})`;

    switch (step.type) {
      case "move":
      case "click":
      case "doubleClick":
      case "rightClick":
      case "clear":
      case "focus":
      case "blur":
      case "check":
      case "uncheck":
      case "highlight": {
        const optionCode = options(["type", "target"]);
        return withOptions(`${prefix}${step.type}(${target()}`, optionCode);
      }
      case "type": {
        const optionCode = options(["type", "target", "value"]);
        return withOptions(
          `${prefix}type(${target()}, ${this.formatValue((step as any).value)}`,
          optionCode
        );
      }
      case "wait": {
        if ((step as any).selector) {
          const waitForOptions = {
            selector: (step as any).selector,
            ...this.pickOptions(step, ["type", "selector"])
          };
          return `${prefix}waitFor(${this.formatValue(waitForOptions)})`;
        }
        if (typeof (step as any).duration === "number") {
          const optionCode = options(["type", "duration"]);
          return withOptions(`${prefix}wait(${(step as any).duration}`, optionCode);
        }
        return this.formatValue(step);
      }
      case "scroll": {
        const optionCode = options(["type", "target"]);
        if ((step as any).target) return withOptions(`${prefix}scroll(${target()}`, optionCode);
        return `${prefix}scroll(${optionCode})`;
      }
      case "scrollTo":
        return `${prefix}scrollTo(${(step as any).x}, ${(step as any).y}, ${this.formatValue(
          (step as any).behavior ?? "smooth"
        )})`;
      case "select": {
        const optionCode = options(["type", "target", "value"]);
        return withOptions(
          `${prefix}select(${target()}, ${this.formatValue((step as any).value)}`,
          optionCode
        );
      }
      case "hover": {
        const duration = (step as any).duration;
        const optionCode = options(["type", "target", "duration"]);
        const base = `${prefix}hover(${target()}${duration === undefined ? "" : `, ${duration}`}`;
        return withOptions(base, optionCode);
      }
      case "press": {
        const optionCode = options(["type", "key"]);
        return withOptions(`${prefix}press(${this.formatValue((step as any).key)}`, optionCode);
      }
      case "caption":
        return `${prefix}caption(${this.formatValue((step as any).options)}${
          (step as any).target ? `, ${target()}` : ""
        })`;
      case "drag": {
        const optionCode = options(["type", "source", "target"]);
        return withOptions(
          `${prefix}drag(${this.formatValue((step as any).source)}, ${target()}`,
          optionCode
        );
      }
      default:
        return this.formatValue(step);
    }
  }

  private static formatOptions(step: DemoStep, excluded: string[]): string {
    const picked = this.pickOptions(step, excluded);
    return Object.keys(picked).length ? this.formatValue(picked) : "";
  }

  private static pickOptions(step: DemoStep, excluded: string[]): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(step).filter(([key, value]) => !excluded.includes(key) && value !== undefined)
    );
  }

  private static formatValue(value: unknown): string {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new TypeError("Scenario contains a value that cannot be exported as code.");
    }
    return serialized;
  }
}
