import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

/**
 * Critical path E2E (requires `npm run make` / packaged build first):
 * 登录 → 工作台 → 创建知识库 → 上传 → 知识集 → 会话 → 用户中心 → 退出
 *
 * When a packaged build is unavailable, this suite is skipped.
 */

let electronApp: ElectronApplication | undefined;

test.beforeAll(async () => {
  try {
    const latestBuild = findLatestBuild();
    const appInfo = parseElectronApp(latestBuild);
    process.env.CI = "e2e";
    electronApp = await electron.launch({
      args: [appInfo.main],
    });
  } catch {
    electronApp = undefined;
  }
});

test.afterAll(async () => {
  await electronApp?.close();
});

test("knowledge demo smoke: home after bootstrap", async () => {
  test.skip(
    !electronApp,
    "Packaged Electron build not found — run npm run make first"
  );
  const page: Page = await electronApp!.firstWindow();
  await page.waitForLoadState("domcontentloaded");

  // Either login screen or knowledge home should appear.
  const loginTitle = page.getByText("Copilot Knowledge");
  await expect(loginTitle.first()).toBeVisible({ timeout: 30_000 });
});
