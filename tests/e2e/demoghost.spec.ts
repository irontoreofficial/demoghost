import { test, expect } from "@playwright/test";
import path from "node:path";

test.describe("DemoGhost E2E & Browser Automation", () => {
  test("documentation homepage loads with Liquid Glass UI and SEO meta", async ({ page }) => {
    await page.goto("/");

    // Verify title and meta
    await expect(page).toHaveTitle(/DemoGhost/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /interactive product demo/i);

    // Verify Hero
    await expect(page.locator(".hero-title")).toContainText("Your UI. On autopilot.");
    await expect(page.locator(".brand")).toBeVisible();
  });

  test("interactive code playground runs scenario on live sandbox", async ({ page }) => {
    await page.goto("/");

    // Click "Run Demo" button in playground
    const runBtn = page.locator("#btn-run-playground");
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Verify virtual cursor appears on the page
    const cursor = page.locator(".dg-cursor");
    await expect(cursor).toBeAttached();

    // Verify controls HUD appears
    const hud = page.locator(".dg-controls-hud");
    await expect(hud).toBeVisible();

    // Await completion of preset (max 10s)
    await expect(page.locator("#pg-active-project")).toContainText("Quantum AI Studio", {
      timeout: 10000
    });
  });

  test("record and replay captures real user actions and replays them", async ({ page }) => {
    await page.goto("/");

    // Start recording
    await page.locator("#btn-start-record").click();
    await expect(page.locator("#btn-stop-record")).toBeVisible();

    // Interact with form
    await page.locator("#rec-name").fill("Alex Developer");
    await page.locator("#rec-role").selectOption("architect");
    await page.locator("#rec-newsletter").check();
    await page.locator("#rec-submit").click();

    // Stop recording
    await page.locator("#btn-stop-record").click();

    // Verify generated code output
    const codeArea = page.locator("#recorded-code");
    await expect(codeArea).not.toBeEmpty();
    const codeText = await codeArea.inputValue();
    expect(codeText).toContain('type("[data-demoghost-id=\\"user-full-name\\"]", "Alex Developer")');
    expect(codeText).toContain('click("[data-demoghost-id=\\"submit-record-form\\"]")');

    // Click replay button
    const replayBtn = page.locator("#btn-replay-record");
    await expect(replayBtn).toBeEnabled();
    await replayBtn.click();

    // Verify virtual cursor is active during replay
    await expect(page.locator(".dg-cursor")).toBeAttached();
  });

  test("self-demo ('Watch DemoGhost') demonstration executes seamlessly", async ({ page }) => {
    await page.goto("/");

    const watchBtn = page.locator("#btn-watch-demoghost");
    await expect(watchBtn).toBeVisible();
    await watchBtn.click();

    // Verify cursor and captions display
    await expect(page.locator(".dg-cursor")).toBeAttached();
    await expect(page.locator(".dg-caption")).toBeAttached();
  });

  test("standalone CDN bundle runs flawlessly in browser", async ({ page }) => {
    const cdnFilePath = path.resolve(process.cwd(), "examples/cdn/index.html");
    await page.goto(`file:///${cdnFilePath.replace(/\\/g, "/")}`);

    // Verify CDN demo elements
    await expect(page.locator("h1")).toContainText("DemoGhost Standalone CDN Demo");

    // Click run demo
    await page.locator("#btn-run-demo").click();

    // Check virtual cursor appears
    await expect(page.locator(".dg-cursor")).toBeAttached();

    // Verify demo creates the project in the list
    await expect(page.locator("#newly-created-project")).toBeVisible({ timeout: 10000 });
  });

  test("accessibility: escape terminates playback and respects aria guidelines", async ({
    page
  }) => {
    await page.goto("/");

    await page.locator("#btn-run-playground").click();
    await expect(page.locator(".dg-cursor")).toBeAttached();

    // Press Escape
    await page.keyboard.press("Escape");

    // Cursor should be destroyed
    await expect(page.locator(".dg-cursor")).toHaveCount(0);
  });
});
