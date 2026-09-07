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

  it("identifies autocomplete='cc-number' and autocomplete='cc-csc' as sensitive", () => {
    document.body.innerHTML = `
      <input id="cc" autocomplete="cc-number" value="4000123456789010" />
      <input id="csc" autocomplete="cc-csc" value="888" />
    `;
    const cc = document.querySelector<HTMLInputElement>("#cc")!;
    const csc = document.querySelector<HTMLInputElement>("#csc")!;
    expect(masker.isSensitive(cc)).toBe(true);
    expect(masker.isSensitive(csc)).toBe(true);
    expect(masker.maskValue(cc, "4000123456789010")).toBe("••••••••");
    expect(masker.maskValue(csc, "888")).toBe("••••••••");
  });

  it("masks all nested children within a [data-demoghost-private] container", () => {
    document.body.innerHTML = `
      <div data-demoghost-private id="secret-container">
        <input id="nested-input" type="text" value="nested-secret" />
        <textarea id="nested-area">confidential message</textarea>
        <span id="nested-span">top-secret-info</span>
      </div>
    `;
    const input = document.querySelector<HTMLInputElement>("#nested-input")!;
    const area = document.querySelector<HTMLTextAreaElement>("#nested-area")!;
    const span = document.querySelector<HTMLElement>("#nested-span")!;

    expect(masker.isSensitive(input)).toBe(true);
    expect(masker.isSensitive(area)).toBe(true);
    expect(masker.isSensitive(span)).toBe(true);

    expect(masker.maskValue(input, "nested-secret")).toBe("••••••••");
    expect(masker.maskValue(area, "confidential message")).toBe("••••••••");
  });

  it("respects custom maskSelectors and ignoreSelectors", () => {
    const customMasker = new PrivacyMasker({
      maskSelectors: [".ssn-field"],
      ignoreSelectors: ["#skip-me"]
    });

    document.body.innerHTML = `
      <input class="ssn-field" id="ssn" value="123-45-6789" />
      <input id="skip-me" type="password" value="will-be-ignored" />
    `;

    const ssn = document.querySelector<HTMLInputElement>("#ssn")!;
    const skip = document.querySelector<HTMLInputElement>("#skip-me")!;

    expect(customMasker.isSensitive(ssn)).toBe(true);
    expect(customMasker.shouldIgnore(skip)).toBe(true);
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
