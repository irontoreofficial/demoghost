import { describe, it, expect, beforeEach, vi } from "vitest";
import { PlaybackController } from "../engine/PlaybackController";
import { ActionRegistry } from "../actions/ActionRegistry";
import { registerBuiltinActions } from "../actions/handlers";
import { EventEmitter } from "../events/EventEmitter";
import { DemoScenario } from "../types";

describe("PlaybackController", () => {
  let registry: ActionRegistry;
  let emitter: EventEmitter<any>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="demo-app">
        <button id="step1-btn">Step 1</button>
        <input id="step2-input" type="text" />
        <button id="step3-btn">Step 3</button>
      </div>
    `;

    registry = new ActionRegistry();
    registerBuiltinActions(registry);
    emitter = new EventEmitter();
  });

  it("plays sequential steps and transitions through states", async () => {
    const scenario: DemoScenario = {
      steps: [
        { type: "click", target: "#step1-btn" },
        { type: "type", target: "#step2-input", value: "Antigravity", speed: "instant" },
        { type: "click", target: "#step3-btn" }
      ]
    };

    const controller = new PlaybackController(
      scenario,
      { deterministic: true, speed: 10 },
      registry,
      emitter
    );

    expect(controller.state).toBe("idle");
    expect(controller.totalSteps).toBe(3);

    const onStart = vi.fn();
    const onComplete = vi.fn();
    controller.on("start", onStart);
    controller.on("complete", onComplete);

    await controller.play();

    expect(controller.state).toBe("completed");
    expect(onStart).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();

    const input = document.getElementById("step2-input") as HTMLInputElement;
    expect(input.value).toBe("Antigravity");
  });

  it("handles pause and resume", async () => {
    const scenario: DemoScenario = {
      steps: [
        { type: "wait", duration: 100 },
        { type: "wait", duration: 100 }
      ]
    };

    const controller = new PlaybackController(scenario, {}, registry, emitter);
    const playPromise = controller.play();

    controller.pause();
    expect(controller.state).toBe("paused");

    controller.resume();
    expect(controller.state).toBe("playing");

    await playPromise;
    expect(controller.state).toBe("completed");
  });

  it("stops playback when stop() is called", async () => {
    const scenario: DemoScenario = {
      steps: [
        { type: "wait", duration: 500 },
        { type: "click", target: "#step1-btn" }
      ]
    };

    const controller = new PlaybackController(scenario, {}, registry, emitter);
    const playPromise = controller.play();

    controller.stop();
    expect(controller.state).toBe("stopped");

    await playPromise;
    expect(controller.currentStep).toBeLessThan(2);
  });
});
