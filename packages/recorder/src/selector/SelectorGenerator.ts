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

    // Tier 1: data-demoghost-id attribute
    const demoghostId = element.getAttribute("data-demoghost-id");
    if (demoghostId) {
      return `[data-demoghost-id="${CSS.escape(demoghostId)}"]`;
    }

    // Tier 2: Unique stable element ID
    if (element.id && this.isValidId(element.id)) {
      const idSelector = `#${CSS.escape(element.id)}`;
      if (this.isUnique(idSelector)) {
        return idSelector;
      }
    }

    // Tier 3: Preferred stable test-automation attributes (data-testid, data-cy, data-qa, etc.)
    for (const attr of this.preferredAttributes) {
      const val = element.getAttribute(attr);
      if (val) {
        const sel = `[${attr}="${CSS.escape(val)}"]`;
        if (this.isUnique(sel)) {
          return sel;
        }
      }
    }

    // Tier 4: Semantic interactive attributes: name, aria-label, placeholder, title, alt
    const semanticAttrs = ["name", "aria-label", "placeholder", "title", "alt"];
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

    // Tier 5: ARIA role + semantic tag/attribute combinations
    const role = element.getAttribute("role");
    if (role) {
      const tag = element.tagName.toLowerCase();
      const roleSel = `${tag}[role="${CSS.escape(role)}"]`;
      if (this.isUnique(roleSel)) {
        return roleSel;
      }
      const ariaLabel = element.getAttribute("aria-label");
      if (ariaLabel) {
        const roleWithLabel = `[role="${CSS.escape(role)}"][aria-label="${CSS.escape(ariaLabel)}"]`;
        if (this.isUnique(roleWithLabel)) {
          return roleWithLabel;
        }
      }
    }

    // Tier 6: Text content + tag combination for buttons / links / headings
    const tag = element.tagName.toLowerCase();
    if (["button", "a", "h1", "h2", "h3", "label", "span"].includes(tag)) {
      const text = (element.textContent || "").trim();
      if (text && text.length < 30 && !text.includes("\n")) {
        const textSel = `${tag}:contains("${text.replace(/"/g, '\\"')}")`;
        const matches = Array.from(document.querySelectorAll(tag)).filter(
          el => (el.textContent || "").trim() === text
        );
        if (matches.length === 1) {
          return textSel;
        }
      }
    }

    // Tier 7: Form Control Specific Attributes (e.g. input[type="email"], button[type="submit"])
    const inputType = element.getAttribute("type");
    if (inputType && ["input", "button"].includes(tag)) {
      const typeSel = `${tag}[type="${CSS.escape(inputType)}"]`;
      if (this.isUnique(typeSel)) {
        return typeSel;
      }
    }

    // Tier 8: Unique clean CSS class combination
    const classSelector = this.getUniqueClassSelector(element);
    if (classSelector) {
      return classSelector;
    }

    // Tier 9: Contextual Ancestor Scoping (parent/container ID or form + selector)
    const contextualSel = this.getContextualSelector(element);
    if (contextualSel) {
      return contextualSel;
    }

    // Tier 10: Hierarchical structural CSS path with nth-of-type fallback
    return this.getHierarchicalPath(element);
  }

  private getContextualSelector(element: HTMLElement): string | null {
    let parent = element.parentElement;
    while (parent && parent !== document.body && parent !== document.documentElement) {
      if (parent.id && this.isValidId(parent.id)) {
        const tag = element.tagName.toLowerCase();
        const candidate = `#${CSS.escape(parent.id)} ${tag}`;
        if (this.isUnique(candidate)) return candidate;

        // Try with class if available
        const classes = Array.from(element.classList).filter(c => !this.ignoreClasses.has(c));
        if (classes.length > 0) {
          const candidateWithClass = `#${CSS.escape(parent.id)} ${tag}.${CSS.escape(classes[0])}`;
          if (this.isUnique(candidateWithClass)) return candidateWithClass;
        }
      }
      parent = parent.parentElement;
    }
    return null;
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
