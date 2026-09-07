import { describe, it, expect, beforeEach } from "vitest";
import { TargetResolver } from "../targeting/TargetResolver";
import { DemoGhostTargetNotFoundError } from "../errors";

describe("TargetResolver", () => {
  let resolver: TargetResolver;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container">
        <button id="unique-btn" data-demoghost-id="submit-action">Submit</button>
        <input type="text" name="username" placeholder="Enter username" />
        <div class="card">
          <span class="label">Total Price: $99</span>
        </div>
      </div>
    `;
    resolver = new TargetResolver(500);
  });

  it("resolves by direct CSS selector", async () => {
    const el = await resolver.resolve("#unique-btn");
    expect(el).not.toBeNull();
    expect(el.id).toBe("unique-btn");
  });

  it("resolves by data-demoghost-id shorthand (@id)", async () => {
    const el = await resolver.resolve("@submit-action");
    expect(el).not.toBeNull();
    expect(el.id).toBe("unique-btn");
  });

  it("resolves by HTMLElement directly", async () => {
    const directEl = document.getElementById("unique-btn")!;
    const el = await resolver.resolve(directEl);
    expect(el).toBe(directEl);
  });

  it("resolves by text search with :has-text", async () => {
    const el = await resolver.resolve("button:has-text('Submit')");
    expect(el).not.toBeNull();
    expect(el.id).toBe("unique-btn");
  });

  it("throws DemoGhostTargetNotFoundError when target is not found", async () => {
    await expect(resolver.resolve("#non-existent-element", 0)).rejects.toThrow(
      DemoGhostTargetNotFoundError
    );
  });

  it("resolves optional target returning null on failure", async () => {
    const el = await resolver.resolveOptional("#missing");
    expect(el).toBeNull();
  });
});
