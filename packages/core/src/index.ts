import { DemoScenario, DemoStep, PlaybackOptions, DemoGhostConfig, PlaybackEvents } from "./types";
import { ActionRegistry } from "./actions/ActionRegistry";
import { registerBuiltinActions } from "./actions/handlers";
import { PlaybackController } from "./engine/PlaybackController";
import { EventEmitter } from "./events/EventEmitter";
import "./styles/demoghost.css";

// Export types
export * from "./types";
export * from "./errors";
export * from "./actions/creators";
export { ActionRegistry } from "./actions/ActionRegistry";
export { PlaybackController } from "./engine/PlaybackController";
export { EventEmitter } from "./events/EventEmitter";
export { TargetResolver } from "./targeting/TargetResolver";
export { CursorEngine } from "./cursor/CursorEngine";
export { ScrollEngine } from "./scroll/ScrollEngine";
export { SpotlightEngine } from "./spotlight/SpotlightEngine";
export { ThemeManager } from "./theme/theme";
export { AccessibilityManager } from "./accessibility/a11y";

export class DemoGhostCore {
  private static globalConfig: DemoGhostConfig = {};
  public static actions = new ActionRegistry();
  private static globalEmitter = new EventEmitter<PlaybackEvents>();

  static {
    registerBuiltinActions(DemoGhostCore.actions);
  }

  private static activeController: PlaybackController | null = null;

  public static configure(config: DemoGhostConfig): void {
    DemoGhostCore.globalConfig = { ...DemoGhostCore.globalConfig, ...config };
  }

  public static play(
    scenarioOrSteps: DemoScenario | DemoStep[],
    options: PlaybackOptions = {}
  ): PlaybackController {
    // Controlled cancellation: Stop previous running instance to avoid state corruption or duplicate cursors
    if (
      DemoGhostCore.activeController &&
      (DemoGhostCore.activeController.state === "playing" ||
        DemoGhostCore.activeController.state === "paused")
    ) {
      DemoGhostCore.activeController.stop();
    }

    const scenario: DemoScenario = Array.isArray(scenarioOrSteps)
      ? { steps: scenarioOrSteps }
      : scenarioOrSteps;

    const mergedOptions: PlaybackOptions = {
      ...DemoGhostCore.globalConfig,
      ...options
    };

    const controller = new PlaybackController(
      scenario,
      mergedOptions,
      DemoGhostCore.actions,
      DemoGhostCore.globalEmitter
    );

    DemoGhostCore.activeController = controller;

    if (mergedOptions.autoStart !== false) {
      controller.play().catch(err => {
        if (mergedOptions.debug) {
          console.error("[DemoGhost] Playback error:", err);
        }
      });
    }

    return controller;
  }

  public static create(scenario: DemoScenario, defaultOptions: PlaybackOptions = {}) {
    return {
      play: (options: PlaybackOptions = {}) =>
        DemoGhostCore.play(scenario, { ...defaultOptions, ...options })
    };
  }

  public static on<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): () => void {
    return DemoGhostCore.globalEmitter.on(event, listener);
  }

  public static off<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): void {
    DemoGhostCore.globalEmitter.off(event, listener);
  }
}

// Global browser attachment for CDN or script tag
if (typeof window !== "undefined") {
  (window as any).DemoGhostCore = DemoGhostCore;
}
