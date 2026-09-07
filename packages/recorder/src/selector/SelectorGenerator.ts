export interface SelectorOptions {
  preferredAttributes?: string[];
  ignoreClasses?: string[];
  maxDepth?: number;
}

export class SelectorGenerator {
  private preferredAttributes: string[];
  private ignoreClasses: Set<string>;
  private maxDepth: number;

  constructor(options: SelectorOptions = {}) {
    this.preferredAttributes = options.preferredAttributes || [
      "data-demoghost-id",
      "data-testid",
      "data-test-id",
      "data-cy",
      "data-qa",
      "data-action"
    ];
    this.ignoreClasses = new Set([
      "dg-cursor",
      "dg-caption",
      "dg-controls",
      "active",
      "focus",
      "hover",
      "selected",
      ...(options.ignoreClasses || [])
    ]);
    this.maxDepth = options.maxDepth || 5;
  }

  public generate(element: HTMLElement): string {
    if (!element || !(element instanceof HTMLElement)) {
      return "";
    }

    // 1. Check data-demoghost-id
    const demoghostId = element.getAttribute("data-demoghost-id");
    if (demoghostId) {
      return `[data-demoghost-id="${CSS.escape(demoghostId)}"]`;
    }

    // 2. Check unique valid ID
    if (element.id && this.isValidId(element.id)) {
      const idSelector = `#${CSS.escape(element.id)}`;
      if (this.isUnique(idSelector)) {
        return idSelector;
      }
    }

    // 3. Preferred stable data-* attributes
    for (const attr of this.preferredAttributes) {
      const val = element.getAttribute(attr);
      if (val) {
        const sel = `[${attr}="${CSS.escape(val)}"]`;
        if (this.isUnique(sel)) {
          return sel;
        }
      }
    }

    // 4. Semantic attributes: name, aria-label, role, placeholder
    const semanticAttrs = ["name", "aria-label", "placeholder", "role"];
    for (const attr of semanticAttrs) {
      const val = element.getAttribute(attr);
      if (val) {
        const tag = element.tagName.toLowerCase();
        const sel = `${tag}[${attr}="${CSS.escape(val)}"]`;
        if (this.isUnique(sel)) {
          return sel;
        }
      }
    }

    // 5. Text content + tag combination for buttons / links / headings
    const tag = element.tagName.toLowerCase();
    if (["button", "a", "h1", "h2", "h3", "label"].includes(tag)) {
      const text = (element.textContent || "").trim();
      if (text && text.length < 30 && !text.includes("\n")) {
        const textSel = `${tag}:contains("${text.replace(/"/g, '\\"')}")`;
        // Check uniqueness via querySelector
        const matches = Array.from(document.querySelectorAll(tag)).filter(
          el => (el.textContent || "").trim() === text
        );
        if (matches.length === 1) {
          return textSel;
        }
      }
    }

    // 6. Unique class combination
    const classSelector = this.getUniqueClassSelector(element);
    if (classSelector) {
      return classSelector;
    }

    // 7. Hierarchical structural CSS path
    return this.getHierarchicalPath(element);
  }

  private isValidId(id: string): boolean {
    // Avoid dynamic auto-generated IDs (like :r1:, dynamic UUIDs, etc.)
    if (/^[0-9]/.test(id) || /:[a-z0-9]+:/i.test(id) || /^__/.test(id)) {
      return false;
    }
    return /^[a-zA-Z][a-zA-Z0-9_:-]*$/.test(id);
  }

  private isUnique(selector: string): boolean {
    try {
      return document.querySelectorAll(selector).length === 1;
    } catch {
      return false;
    }
  }

  private getUniqueClassSelector(element: HTMLElement): string | null {
    const classes = Array.from(element.classList).filter(c => !this.ignoreClasses.has(c));
    if (classes.length === 0) return null;

    const tag = element.tagName.toLowerCase();

    // Try single class
    for (const cls of classes) {
      const sel = `${tag}.${CSS.escape(cls)}`;
      if (this.isUnique(sel)) return sel;
    }

    // Try combined classes
    if (classes.length > 1) {
      const combined = `${tag}.${classes.map(c => CSS.escape(c)).join(".")}`;
      if (this.isUnique(combined)) return combined;
    }

    return null;
  }

  private getHierarchicalPath(element: HTMLElement): string {
    const path: string[] = [];
    let current: HTMLElement | null = element;
    let depth = 0;

    while (
      current &&
      current !== document.body &&
      current !== document.documentElement &&
      depth < this.maxDepth
    ) {
      let segment = current.tagName.toLowerCase();

      if (current.id && this.isValidId(current.id)) {
        segment = `#${CSS.escape(current.id)}`;
        path.unshift(segment);
        break; // Id is root of sub-selector
      }

      const parent: HTMLElement | null = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current!.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          segment += `:nth-of-type(${index})`;
        }
      }

      path.unshift(segment);
      const testSel = path.join(" > ");
      if (this.isUnique(testSel)) {
        return testSel;
      }

      current = parent;
      depth++;
    }

    return path.join(" > ");
  }
}
