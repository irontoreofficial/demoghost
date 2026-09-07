import { describe, it, expect } from "vitest";
import { PrivacyMasker } from "../privacy/PrivacyMasker";

describe("PrivacyMasker", () => {
  const masker = new PrivacyMasker();

  it("identifies input[type=password] as sensitive and masks it", () => {
    document.body.innerHTML = `
      <input type="password" id="pass" value="SuperSecret123" />
    `;
    const input = document.querySelector<HTMLInputElement>("#pass")!;
    expect(masker.isSensitive(input)).toBe(true);
    expect(masker.maskValue(input, "SuperSecret123")).toBe("••••••••");
  });

  it("identifies data-demoghost-private as sensitive", () => {
    document.body.innerHTML = `
      <input type="text" data-demoghost-private value="Secret Token" />
    `;
    const input = document.querySelector<HTMLInputElement>("input")!;
    expect(masker.isSensitive(input)).toBe(true);
    expect(masker.maskValue(input, "Secret Token")).toBe("••••••••");
  });

  it("identifies credit card keywords as sensitive", () => {
    document.body.innerHTML = `
      <input type="text" name="creditCardNumber" value="4111222233334444" />
    `;
    const input = document.querySelector<HTMLInputElement>("input")!;
    expect(masker.isSensitive(input)).toBe(true);
  });

  it("does not mask standard harmless inputs", () => {
    document.body.innerHTML = `
      <input type="text" name="city" value="Berlin" />
    `;
    const input = document.querySelector<HTMLInputElement>("input")!;
    expect(masker.isSensitive(input)).toBe(false);
    expect(masker.maskValue(input, "Berlin")).toBe("Berlin");
  });

  it("ignores DemoGhost internal UI elements", () => {
    document.body.innerHTML = `
      <div class="dg-controls">
        <button id="ctrl-btn">Play</button>
      </div>
    `;
    const btn = document.querySelector<HTMLElement>("#ctrl-btn")!;
    expect(masker.shouldIgnore(btn)).toBe(true);
  });
});
