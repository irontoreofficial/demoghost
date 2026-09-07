import {
  DemoGhostCore,
  type DemoScenario,
  type DemoStep,
  type PlaybackOptions,
  type DemoGhostConfig,
  type PlaybackEvents,
  PlaybackController
} from "../../core/src/index";
import { DemoGhostRecorder, EventRecorder, type RecorderOptions } from "../../recorder/src/index";
import { DemoGhostControls } from "../../controls/src/index";
import "./styles.css";

import * as actionCreators from "../../core/src/index";

// Re-export all core exports
export * from "../../core/src/index";
// Re-export recorder
export * from "../../recorder/src/index";
// Re-export controls
export * from "../../controls/src/index";

export class DemoGhost {
  public static actions = DemoGhostCore.actions;

  public static configure(config: DemoGhostConfig): void {
    DemoGhostCore.configure(config);
  }

  public static play(
    scenarioOrSteps: DemoScenario | DemoStep[],
    options: PlaybackOptions = {}
  ): PlaybackController {
    const controller = DemoGhostCore.play(scenarioOrSteps, options);

    // Auto-attach controls HUD if options.controls !== false
    if (options.controls !== false) {
      new DemoGhostControls(controller, {
        container: options.container
      });
    }

    return controller;
  }

  public static record(options: RecorderOptions = {}): EventRecorder {
    return DemoGhostRecorder.record(options);
  }

  public static create(scenario: DemoScenario, defaultOptions: PlaybackOptions = {}) {
    return {
      play: (options: PlaybackOptions = {}) =>
        DemoGhost.play(scenario, { ...defaultOptions, ...options })
    };
  }

  public static serialize(scenario: DemoScenario): string {
    return DemoGhostRecorder.serialize(scenario);
  }

  public static deserialize(json: string): DemoScenario {
    return DemoGhostRecorder.deserialize(json);
  }

  public static toTypeScript(scenario: DemoScenario): string {
    return DemoGhostRecorder.toTypeScript(scenario);
  }

  public static toJavaScript(scenario: DemoScenario): string {
    return DemoGhostRecorder.toJavaScript(scenario);
  }

  public static export(scenario: DemoScenario, format: "json" | "ts" | "js" = "json"): string {
    if (format === "ts") return DemoGhost.toTypeScript(scenario);
    if (format === "js") return DemoGhost.toJavaScript(scenario);
    return DemoGhost.serialize(scenario);
  }

  public static on<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): () => void {
    return DemoGhostCore.on(event, listener);
  }

  public static off<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): void {
    DemoGhostCore.off(event, listener);
  }

  // Direct action creator attachments for CDN / Global access
  public static move = actionCreators.move;
  public static click = actionCreators.click;
  public static doubleClick = actionCreators.doubleClick;
  public static rightClick = actionCreators.rightClick;
  public static type = actionCreators.type;
  public static clear = actionCreators.clear;
  public static focus = actionCreators.focus;
  public static blur = actionCreators.blur;
  public static wait = actionCreators.wait;
  public static waitFor = actionCreators.waitFor;
  public static scroll = actionCreators.scroll;
  public static scrollTo = actionCreators.scrollTo;
  public static select = actionCreators.select;
  public static check = actionCreators.check;
  public static uncheck = actionCreators.uncheck;
  public static hover = actionCreators.hover;
  public static press = actionCreators.press;
  public static highlight = actionCreators.highlight;
  public static caption = actionCreators.caption;
  public static drag = actionCreators.drag;
}

// Global browser window attachment for CDN
if (typeof window !== "undefined") {
  (window as any).DemoGhost = DemoGhost;
  // Also attach individual functions to global scope for easy inline script tags if needed
  (window as any).dg = DemoGhost;
}

export default DemoGhost;
