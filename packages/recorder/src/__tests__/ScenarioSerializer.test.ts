import { describe, it, expect } from "vitest";
import { ScenarioSerializer } from "../serialization/ScenarioSerializer";
import { DemoScenario } from "@demoghost/core";

describe("ScenarioSerializer", () => {
  const sampleScenario: DemoScenario = {
    id: "test-scenario",
    steps: [
      { type: "click", target: "#new-project" },
      { type: "type", target: "#project-name", value: "Demo App" },
      { type: "click", target: "#submit" }
    ]
  };

  it("serializes and deserializes JSON roundtrip accurately", () => {
    const json = ScenarioSerializer.serialize(sampleScenario);
    const parsed = ScenarioSerializer.deserialize(json);
    expect(parsed.steps.length).toBe(3);
    expect(parsed.steps[0].target).toBe("#new-project");
    expect((parsed.steps[1] as any).value).toBe("Demo App");
  });

  it("exports formatted TypeScript code snippet", () => {
    const tsCode = ScenarioSerializer.toTypeScript(sampleScenario);
    expect(tsCode).toContain('import { DemoGhost, click, type } from "demoghost";');
    expect(tsCode).toContain('click("#new-project")');
    expect(tsCode).toContain('type("#project-name", "Demo App")');
    expect(tsCode).toContain("await DemoGhost.play(scenario);");
  });

  it("exports formatted JavaScript code snippet", () => {
    const jsCode = ScenarioSerializer.toJavaScript(sampleScenario);
    expect(jsCode).toContain('DemoGhost.click("#new-project")');
    expect(jsCode).toContain('DemoGhost.type("#project-name", "Demo App")');
    expect(jsCode).toContain("DemoGhost.play(scenario);");
  });
});
