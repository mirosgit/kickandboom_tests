import { test as base } from '@playwright/test';
import { LandingPage } from '../pages/landing-page';
import { RuntimeMonitor } from '../utils/runtime-monitor';

type Fixtures = {
  landingPage: LandingPage;
  runtimeMonitor: RuntimeMonitor;
};

export const test = base.extend<Fixtures>({
  runtimeMonitor: async ({ context, page }, use) => {
    const runtimeMonitor = new RuntimeMonitor();
    const attachPage = runtimeMonitor.attach.bind(runtimeMonitor);

    context.on('page', attachPage);
    runtimeMonitor.attach(page);

    await use(runtimeMonitor);

    context.off('page', attachPage);
  },

  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  }
});

export { expect } from '@playwright/test';
