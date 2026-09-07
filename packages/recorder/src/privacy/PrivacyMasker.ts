export interface PrivacyOptions {
  maskPasswords?: boolean;
  maskSelectors?: string[];
  ignoreSelectors?: string[];
}

export class PrivacyMasker {
  private maskPasswords: boolean;
  private maskSelectors: string[];
  private ignoreSelectors: string[];

  constructor(options: PrivacyOptions = {}) {
    this.maskPasswords = options.maskPasswords !== false;
    this.maskSelectors = [
      "[data-demoghost-private]",
      "[data-private]",
      ".secret",
      ".private",
      ".confidential",
      ...(options.maskSelectors || [])
    ];
    this.ignoreSelectors = options.ignoreSelectors || [];
  }

  public shouldIgnore(element: HTMLElement): boolean {
    if (!element) return true;

    // Ignore internal DemoGhost UI elements
    if (
      element.closest(".dg-cursor") ||
      element.closest(".dg-controls") ||
      element.closest(".dg-controls-container") ||
      element.closest(".dg-controls-hud") ||
      element.closest(".dg-caption") ||
      element.closest(".dg-spotlight-backdrop")
    ) {
      return true;
    }

    for (const selector of this.ignoreSelectors) {
      if (element.matches(selector) || element.closest(selector)) {
        return true;
      }
    }

    return false;
  }

  public isSensitive(element: HTMLElement): boolean {
    if (!element) return false;

    // Password input check
    if (this.maskPasswords) {
      if (element instanceof HTMLInputElement && element.type.toLowerCase() === "password") {
        return true;
      }
    }

    // Name / autocomplete checks for sensitive fields
    const sensitiveText = ["name", "id", "autocomplete", "placeholder", "aria-label"]
      .map(attribute => element.getAttribute(attribute) || "")
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

    const sensitiveKeywords = [
      "password",
      "secret",
      "creditcard",
      "cardnumber",
      "ccnumber",
      "cvv",
      "cvc",
      "csc",
      "cccsc",
      "securitycode",
      "pin",
      "passphrase",
      "ssn",
      "token",
      "apikey",
      "accesstoken",
      "clientsecret",
      "onetimecode"
    ];

    for (const keyword of sensitiveKeywords) {
      if (sensitiveText.includes(keyword)) {
        return true;
      }
    }

    // Explicit mask selectors
    for (const selector of this.maskSelectors) {
      try {
        if (element.matches(selector) || element.closest(selector)) {
          return true;
        }
      } catch {
        // Invalid selector string
      }
    }

    return false;
  }

  public maskValue(element: HTMLElement, originalValue: string): string {
    if (this.isSensitive(element)) {
      return "••••••••";
    }
    return originalValue;
  }
}
