import { EventRecorder, type RecorderOptions } from "./capture/EventRecorder";
import { ScenarioSerializer } from "./serialization/ScenarioSerializer";
import type { DemoScenario } from "@demoghost/core";

export { EventRecorder } from "./capture/EventRecorder";
export type { RecorderOptions } from "./capture/EventRecorder";
export { SelectorGenerator } from "./selector/SelectorGenerator";
export type { SelectorOptions } from "./selector/SelectorGenerator";
export { PrivacyMasker } from "./privacy/PrivacyMasker";
export type { PrivacyOptions } from "./privacy/PrivacyMasker";
export { ScenarioSerializer } from "./serialization/ScenarioSerializer";

export class DemoGhostRecorder {
  public static record(options: RecorderOptions = {}): EventRecorder {
    const recorder = new EventRecorder(options);
    recorder.start();
    return recorder;
  }

  public static serialize(scenario: DemoScenario): string {
    return ScenarioSerializer.serialize(scenario);
  }

  public static deserialize(json: string): DemoScenario {
    return ScenarioSerializer.deserialize(json);
  }

  public static toTypeScript(scenario: DemoScenario): string {
    return ScenarioSerializer.toTypeScript(scenario);
  }

  public static toJavaScript(scenario: DemoScenario): string {
    return ScenarioSerializer.toJavaScript(scenario);
  }
}
