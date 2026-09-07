import type { DemoScenario, DemoStep } from "@demoghost/core";

export class ScenarioSerializer {
  public static serialize(scenario: DemoScenario): string {
    return JSON.stringify(scenario, null, 2);
  }

  public static deserialize(json: string): DemoScenario {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.steps)) {
        throw new Error("Invalid scenario JSON: 'steps' array is required.");
      }
      return parsed as DemoScenario;
    } catch (err: any) {
      throw new Error(`Failed to deserialize DemoGhost scenario: ${err.message}`);
    }
  }

  public static toTypeScript(scenario: DemoScenario): string {
    const usedActions = new Set<string>();
    const stepLines: string[] = [];

    for (const step of scenario.steps) {
      usedActions.add(step.type);
      stepLines.push(this.formatStepCode(step));
    }

    const imports = Array.from(usedActions).sort().join(", ");

    return `import { DemoGhost, ${imports} } from "demoghost";

export const scenario = [
  ${stepLines.join(",\n  ")}
];

// Play scenario
await DemoGhost.play(scenario);
`;
  }

  public static toJavaScript(scenario: DemoScenario): string {
    const stepLines = scenario.steps.map(step => this.formatStepCode(step, "DemoGhost."));

    return `// DemoGhost Scenario Replay
const scenario = [
  ${stepLines.join(",\n  ")}
];

DemoGhost.play(scenario);
`;
  }

  private static formatStepCode(step: DemoStep, prefix = ""): string {
    const targetStr =
      typeof step.target === "string" ? JSON.stringify(step.target) : JSON.stringify(step.target);

    switch (step.type) {
      case "click":
        return `${prefix}click(${targetStr})`;
      case "doubleClick":
        return `${prefix}doubleClick(${targetStr})`;
      case "rightClick":
        return `${prefix}rightClick(${targetStr})`;
      case "type":
        return `${prefix}type(${targetStr}, ${JSON.stringify(step.value)})`;
      case "clear":
        return `${prefix}clear(${targetStr})`;
      case "focus":
        return `${prefix}focus(${targetStr})`;
      case "blur":
        return `${prefix}blur(${targetStr})`;
      case "wait":
        if (step.duration) return `${prefix}wait(${step.duration})`;
        if (step.selector) return `${prefix}waitFor(${JSON.stringify(step.selector)})`;
        return `${prefix}wait(500)`;
      case "scroll":
        return step.target ? `${prefix}scroll(${targetStr})` : `${prefix}scroll()`;
      case "select":
        return `${prefix}select(${targetStr}, ${JSON.stringify(step.value)})`;
      case "check":
        return `${prefix}check(${targetStr})`;
      case "uncheck":
        return `${prefix}uncheck(${targetStr})`;
      case "hover":
        return `${prefix}hover(${targetStr})`;
      case "press":
        return `${prefix}press(${JSON.stringify(step.key)})`;
      case "highlight":
        return `${prefix}highlight(${targetStr})`;
      case "caption":
        return `${prefix}caption(${JSON.stringify(step.options)})`;
      default:
        return JSON.stringify(step);
    }
  }
}
