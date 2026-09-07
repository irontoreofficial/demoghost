import { describe, it, expect, beforeEach } from "vitest";
import { SelectorGenerator } from "../selector/SelectorGenerator";

describe("SelectorGenerator", () => {
  let generator: SelectorGenerator;

  beforeEach(() => {
    generator = new SelectorGenerator();
  });

  it("prioritizes data-demoghost-id (Tier 1)", () => {
    document.body.innerHTML = `
      <button id="regular-id" data-demoghost-id="create-project-btn">Create</button>
    `;
    const btn = document.querySelector("button")!;
    const selector = generator.generate(btn);
    expect(selector).toBe('[data-demoghost-id="create-project-btn"]');
  });

  it("uses unique id when data-demoghost-id is not present (Tier 2)", () => {
    document.body.innerHTML = `
      <button id="checkout-btn">Checkout</button>
    `;
    const btn = document.querySelector("button")!;
    const selector = generator.generate(btn);
    expect(selector).toBe("#checkout-btn");
  });

  it("uses stable data-testid (Tier 3)", () => {
    document.body.innerHTML = `
      <button data-testid="submit-form-action">Submit</button>
    `;
    const btn = document.querySelector("button")!;
    const selector = generator.generate(btn);
    expect(selector).toBe('[data-testid="submit-form-action"]');
  });

  it("uses semantic name attribute (Tier 4)", () => {
    document.body.innerHTML = `
      <input type="text" name="emailAddress" />
    `;
    const input = document.querySelector("input")!;
    const selector = generator.generate(input);
    expect(selector).toBe('input[name="emailAddress"]');
  });

  it("uses button text contains when unique (Tier 5)", () => {
    document.body.innerHTML = `
      <div class="actions">
        <button class="btn">Launch Rocket</button>
      </div>
    `;
    const btn = document.querySelector("button")!;
    const selector = generator.generate(btn);
    expect(selector).toBe('button:contains("Launch Rocket")');
  });
});
