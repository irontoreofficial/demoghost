import { DemoTheme, CustomTheme } from "../types";

export const THEME_PRESETS: Record<string, CustomTheme> = {
  light: {
    accent: "#6366f1",
    cursor: "#0f172a",
    glassBg: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#0f172a",
    shadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
    zIndexCursor: 999999,
    zIndexOverlay: 999990
  },
  dark: {
    accent: "#818cf8",
    cursor: "#f8fafc",
    glassBg: "rgba(15, 23, 42, 0.82)",
    border: "rgba(255, 255, 255, 0.12)",
    text: "#f8fafc",
    shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndexCursor: 999999,
    zIndexOverlay: 999990
  },
  glass: {
    accent: "#6366f1",
    cursor: "#0f172a",
    glassBg: "rgba(255, 255, 255, 0.65)",
    border: "rgba(255, 255, 255, 0.35)",
    text: "#0f172a",
    shadow: "0 20px 50px rgba(99, 102, 241, 0.15)",
    zIndexCursor: 999999,
    zIndexOverlay: 999990
  }
};

export class ThemeManager {
  public static apply(theme: DemoTheme = "glass", container?: HTMLElement): void {
    if (typeof document === "undefined") return;

    const target = container || document.documentElement;

    let resolvedTheme: CustomTheme = THEME_PRESETS.glass;

    if (typeof theme === "string") {
      if (theme === "auto") {
        const isDark =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolvedTheme = isDark ? THEME_PRESETS.dark : THEME_PRESETS.light;
      } else if (THEME_PRESETS[theme]) {
        resolvedTheme = THEME_PRESETS[theme];
      }
    } else if (typeof theme === "object") {
      resolvedTheme = { ...THEME_PRESETS.glass, ...theme };
    }

    if (resolvedTheme.accent) target.style.setProperty("--demoghost-accent", resolvedTheme.accent);
    if (resolvedTheme.cursor) target.style.setProperty("--demoghost-cursor", resolvedTheme.cursor);
    if (resolvedTheme.glassBg)
      target.style.setProperty("--demoghost-glass-bg", resolvedTheme.glassBg);
    if (resolvedTheme.border) target.style.setProperty("--demoghost-border", resolvedTheme.border);
    if (resolvedTheme.text) target.style.setProperty("--demoghost-text", resolvedTheme.text);
    if (resolvedTheme.shadow) target.style.setProperty("--demoghost-shadow", resolvedTheme.shadow);
    if (resolvedTheme.zIndexCursor)
      target.style.setProperty("--demoghost-z-index-cursor", String(resolvedTheme.zIndexCursor));
    if (resolvedTheme.zIndexOverlay)
      target.style.setProperty("--demoghost-z-index-overlay", String(resolvedTheme.zIndexOverlay));
  }
}
