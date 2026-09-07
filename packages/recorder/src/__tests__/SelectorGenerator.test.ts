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

  it("uses button text contains when unique (Tier 6)", () => {
    document.body.innerHTML = `
      <div class="actions">
        <button class="btn">Launch Rocket</button>
      </div>
    `;
    const btn = document.querySelector("button")!;
    const selector = generator.generate(btn);
    expect(selector).toBe('button:contains("Launch Rocket")');
  });

  it("uses ARIA role (Tier 5)", () => {
    document.body.innerHTML = `
      <div role="navigation">Nav</div>
    `;
    const el = document.querySelector("div")!;
    const selector = generator.generate(el);
    expect(selector).toBe('div[role="navigation"]');
  });

  it("uses form control type attribute (Tier 7)", () => {
    document.body.innerHTML = `
      <form>
        <button type="submit">Go</button>
      </form>
    `;
    const btn = document.querySelector("button")!;
    const selector = generator.generate(btn);
    // Button text contains or type="submit"
    expect(selector).toBe('button:contains("Go")');
  });

  it("uses unique clean class combination (Tier 8)", () => {
    document.body.innerHTML = `
      <div class="card-item feature-highlight">Card</div>
    `;
    const div = document.querySelector("div")!;
    const selector = generator.generate(div);
    expect(selector).toContain(".card-item");
  });

  it("uses contextual parent scoping (Tier 9)", () => {
    document.body.innerHTML = `
      <div id="settings-panel">
        <button class="save">Save</button>
      </div>
      <div id="other-panel">
        <button class="save">Save</button>
      </div>
    `;
    const btn = document.querySelector<HTMLElement>("#settings-panel button")!;
    const selector = generator.generate(btn);
    expect(selector).toContain("#settings-panel");
  });

  it("uses hierarchical nth-of-type path fallback (Tier 10)", () => {
    document.body.innerHTML = `
      <section>
        <div>Item 1</div>
        <div>Item 2</div>
      </section>
    `;
    const div2 = document.querySelectorAll<HTMLElement>("div")[1];
    const selector = generator.generate(div2);
    expect(selector).toContain(":nth-of-type(2)");
  });
});
