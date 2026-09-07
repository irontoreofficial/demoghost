import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CursorEngine } from "../cursor/CursorEngine";

describe("CursorEngine", () => {
  let engine: CursorEngine;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    engine = new CursorEngine({
      deterministic: true,
      cursor: { style: "classic" }
    });
  });

  afterEach(() => {
    engine.destroy();
  });

  it("mounts cursor element to DOM with aria-hidden", () => {
    const cursorEl = document.querySelector(".dg-cursor");
    expect(cursorEl).not.toBeNull();
    expect(cursorEl?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders touch orb when pointer mode is touch", () => {
    const touchEngine = new CursorEngine({ pointerMode: "touch" });
    const orb = document.querySelector(".dg-touch-orb");
    expect(orb).not.toBeNull();
    touchEngine.destroy();
  });

  it("updates position when moveTo is called", async () => {
    await engine.moveTo(250, 350, 10);
    const pos = engine.getPosition();
    expect(pos.x).toBe(250);
    expect(pos.y).toBe(350);
  });

  it("updates state classes", () => {
    const cursorEl = document.querySelector(".dg-cursor")!;
    engine.setState("pointer");
    expect(cursorEl.classList.contains("dg-state-pointer")).toBe(true);

    engine.setState("text");
    expect(cursorEl.classList.contains("dg-state-text")).toBe(true);
    expect(cursorEl.classList.contains("dg-state-pointer")).toBe(false);
  });

  it("cleans up on destroy", () => {
    engine.destroy();
    expect(document.querySelector(".dg-cursor")).toBeNull();
  });
});
