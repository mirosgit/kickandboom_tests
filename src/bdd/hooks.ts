import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, type BrowserType, type Page } from '@playwright/test';
import { env } from '../config/environment';
import { LandingPage } from '../pages/landing-page';
import { RuntimeMonitor } from '../utils/runtime-monitor';
import { CustomWorld } from './custom-world';

type SupportedBrowserName = 'chromium' | 'firefox' | 'webkit';

setDefaultTimeout(90_000);

const browserTypes: Record<SupportedBrowserName, BrowserType> = {
  chromium,
  firefox,
  webkit
};

function getBrowserType(): BrowserType {
  const browserName = (process.env.BDD_BROWSER ?? 'chromium') as SupportedBrowserName;
  const browserType = browserTypes[browserName];

  if (!browserType) {
    throw new Error(`Unsupported BDD_BROWSER value: ${browserName}`);
  }

  return browserType;
}

function isHeadless(): boolean {
  return process.env.HEADED !== 'true';
}

Before(async function (this: CustomWorld) {
  this.browser = await getBrowserType().launch({
    headless: isHeadless()
  });

  this.context = await this.browser.newContext({
    baseURL: env.baseUrl,
    viewport: { width: 1440, height: 900 }
  });

  this.page = await this.context.newPage();
  this.runtimeMonitor = new RuntimeMonitor();
  this.runtimeMonitor.attach(this.page);
  this.landingPage = new LandingPage(this.page);
});

After(async function (this: CustomWorld, scenario) {
  const pages = [this.page, this.targetPage].filter(Boolean) as Page[];

  if (scenario.result?.status === Status.FAILED) {
    for (const page of pages) {
      try {
        this.attach(await page.screenshot({ fullPage: true }), 'image/png');
      } catch {
        // Screenshot attachment is best-effort during cleanup.
      }
    }
  }

  await this.context?.close().catch(() => undefined);
  await this.browser?.close().catch(() => undefined);
});
