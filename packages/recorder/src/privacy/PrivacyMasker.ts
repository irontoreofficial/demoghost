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
    const name = (element.getAttribute("name") || "").toLowerCase();
    const autocomplete = (element.getAttribute("autocomplete") || "").toLowerCase();
    const placeholder = (element.getAttribute("placeholder") || "").toLowerCase();

    const sensitiveKeywords = [
      "password",
      "secret",
      "creditcard",
      "cardnumber",
      "cvv",
      "cvc",
      "ssn",
      "token",
      "apikey"
    ];

    for (const keyword of sensitiveKeywords) {
      if (
        name.includes(keyword) ||
        autocomplete.includes(keyword) ||
        placeholder.includes(keyword)
      ) {
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
