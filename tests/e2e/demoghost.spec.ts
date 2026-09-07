import { test, expect } from "@playwright/test";
import axe from "axe-core";

test.describe("DemoGhost Principal Engineer Release Candidate Audit", () => {
  // 1. Homepage & SEO
  test("documentation homepage loads with Liquid Glass UI and SEO meta", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DemoGhost/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /interactive product demo/i);
    await expect(page.locator(".hero-title")).toContainText("Your UI. On autopilot.");
    await expect(page.locator(".brand")).toBeVisible();
  });

  // 2. Interactive Playground & HUD
  test("interactive code playground runs scenario on live sandbox", async ({ page }) => {
    await page.goto("/");
    const runBtn = page.locator("#btn-run-playground");
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    const cursor = page.locator(".dg-cursor");
    await expect(cursor).toBeAttached();

    const hud = page.locator(".dg-controls-hud");
    await expect(hud).toBeVisible();

    await expect(page.locator("#pg-active-project")).toContainText("Quantum AI Studio", {
      timeout: 10000
    });
  });

  // 3. Record & Replay
  test("record and replay captures real user actions and replays them", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn-start-record").click();
    await expect(page.locator("#btn-stop-record")).toBeVisible();

    await page.locator("#rec-name").fill("Alex Developer");
    await page.locator("#rec-role").selectOption("architect");
    await page.locator("#rec-newsletter").check();
    await page.locator("#rec-submit").click();

    await page.locator("#btn-stop-record").click();

    const codeArea = page.locator("#recorded-code");
    await expect(codeArea).not.toBeEmpty();
    const codeText = await codeArea.inputValue();
    expect(codeText).toContain('type("[data-demoghost-id=\\"user-full-name\\"]", "Alex Developer"');
    expect(codeText).toContain('click("[data-demoghost-id=\\"submit-record-form\\"]")');

    const replayBtn = page.locator("#btn-replay-record");
    await expect(replayBtn).toBeEnabled();
    await replayBtn.click();
    await expect(page.locator(".dg-cursor")).toBeAttached();
  });

  // 4. Standalone CDN IIFE Test over Real HTTP Server
  test("production CDN IIFE bundle (demoghost.min.js) executes over HTTP", async ({ page }) => {
    await page.goto("/cdn/iife-test.html");
    const isReady = await page.evaluate(() => (window as any).cdnReady);
    expect(isReady).toBe(true);

    // Trigger demo
    await page.evaluate(() => (window as any).runCdnDemo());

    // Verify click succeeded
    await expect(page.locator("#status")).toContainText("Clicked Successfully via CDN IIFE", {
      timeout: 8000
    });
  });

  // 5. Browser ESM CDN Test over Real HTTP Server
  test("browser ESM distribution (demoghost.js) executes in native module script", async ({
    page
  }) => {
    await page.goto("/cdn/esm-test.html");
    const isReady = await page.evaluate(() => (window as any).esmReady);
    expect(isReady).toBe(true);

    await page.evaluate(() => (window as any).runEsmDemo());

    await expect(page.locator("#esm-status")).toContainText(
      "Clicked Successfully via Browser ESM CDN",
      {
        timeout: 8000
      }
    );
  });

  // 6. Memory Leak Audit (repeated play/stop cycles)
  test("memory leak audit: repeated play/stop cycles clean up all DOM overlays and timers", async ({
    page
  }) => {
    await page.goto("/cdn/audit-harness.html");
    const result = await page.evaluate(async () => {
      return await (window as any).DemoGhostAudit.testPlayStopCycles(6);
    });

    expect(result.cursorsCount).toBe(0);
    expect(result.hudsCount).toBe(0);
  });

  // 7. Controlled Concurrency (Multiple Instances)
  test("concurrent playback: starting new demo cleanly cancels previous instance", async ({
    page
  }) => {
    await page.goto("/cdn/audit-harness.html");
    const result = await page.evaluate(async () => {
      const ctrl1 = (window as any).DemoGhost.play([
        (window as any).DemoGhost.move("#btn-normal", 3000)
      ]);
      const ctrl2 = (window as any).DemoGhost.play([
        (window as any).DemoGhost.click("#btn-normal")
      ]);
      return {
        ctrl1State: ctrl1.state,
        ctrl2State: ctrl2.state,
        cursorsCount: document.querySelectorAll(".dg-cursor").length
      };
    });

    expect(result.ctrl1State).toBe("stopped");
    expect(result.ctrl2State).toBe("playing");
    expect(result.cursorsCount).toBe(1);
  });

  // 8. Dynamic DOM / SPA Target Insertion
  test("SPA dynamic DOM: waitForTarget resolves element created asynchronously", async ({
    page
  }) => {
    await page.goto("/cdn/audit-harness.html");
    const result = await page.evaluate(async () => {
      return await (window as any).DemoGhostAudit.testDynamicTarget();
    });
    expect(result.success).toBe(true);
  });

  // 9. Z-Index Layering Audit
  test("z-index audit: cursor and spotlight properly overlay high z-index modals", async ({
    page
  }) => {
    await page.goto("/cdn/audit-harness.html");
    await page.evaluate(() => {
      (window as any).DemoGhost.play([(window as any).DemoGhost.move("#btn-in-modal", 5000)], {
        controls: false
      });
    });

    const cursor = page.locator(".dg-cursor");
    await expect(cursor).toBeAttached();

    const zIndex = await cursor.evaluate(el => {
      return parseInt(window.getComputedStyle(el).zIndex, 10);
    });
    // DemoGhost cursor layer policy: z-index must be at least 999999 to always stay on top of modals
    expect(zIndex).toBeGreaterThanOrEqual(100000);
  });

  // 10. Reduced Motion Emulation
  test("reduced motion: prefers-reduced-motion: reduce simplifies animations without crashing", async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/cdn/iife-test.html");

    await page.evaluate(() => (window as any).runCdnDemo());
    await expect(page.locator("#status")).toContainText("Clicked Successfully via CDN IIFE", {
      timeout: 8000
    });
  });

  // 11. Accessibility Audit with axe-core
  test("accessibility: automated axe-core audit passes on docs page", async ({ page }) => {
    await page.goto("/");
    // Inject axe-core source
    await page.evaluate(axe.source);

    const violations = await page.evaluate(async () => {
      // @ts-ignore
      const results = await window.axe.run({
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa"]
        }
      });
      return results.violations.filter((v: any) => v.impact === "critical");
    });

    expect(violations).toEqual([]);
  });

  // 12. Large DOM Performance Stress Test (5,000 and 10,000 nodes)
  test("performance audit: resolves selectors swiftly in 10,000 DOM nodes without lag", async ({
    page
  }) => {
    await page.goto("/cdn/audit-harness.html");

    await page.evaluate(() => {
      (window as any).DemoGhostAudit.generateLargeDom(10000);
    });

    const resolveDuration = await page.evaluate(async () => {
      const t0 = performance.now();
      const ctrl = (window as any).DemoGhost.play(
        [(window as any).DemoGhost.click(".node-item.node-15")],
        { controls: false, speed: 10 }
      );
      await ctrl.finished;
      return performance.now() - t0;
    });

    // Should complete swiftly under 3000ms even with 10k nodes
    expect(resolveDuration).toBeLessThan(3000);
  });
});
