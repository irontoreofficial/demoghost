import { describe, it, expect, vi } from "vitest";
import { ActionRegistry } from "../actions/ActionRegistry";
import { DemoGhostPlaybackError } from "../errors";

describe("ActionRegistry", () => {
  it("registers and retrieves custom action handlers (Open/Closed Principle)", () => {
    const registry = new ActionRegistry();
    const mockHandler = {
      execute: vi.fn().mockResolvedValue(undefined)
    };

    registry.register("celebrate", mockHandler);
    expect(registry.has("celebrate")).toBe(true);

    const retrieved = registry.get("celebrate");
    expect(retrieved).toBe(mockHandler);
  });

  it("registers action handlers from function directly", () => {
    const registry = new ActionRegistry();
    const fn = vi.fn().mockResolvedValue(undefined);

    registry.register("confetti", fn);
    expect(registry.has("confetti")).toBe(true);

    const retrieved = registry.get("confetti");
    expect(typeof retrieved.execute).toBe("function");
  });

  it("throws DemoGhostPlaybackError when requesting an unregistered action", () => {
    const registry = new ActionRegistry();
    expect(() => registry.get("unknown-action")).toThrow(DemoGhostPlaybackError);
  });
});
