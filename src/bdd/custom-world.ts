import { setWorldConstructor, type IWorldOptions, World } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { LandingPage } from '../pages/landing-page';
import { RuntimeMonitor } from '../utils/runtime-monitor';

export type BddWorldFixtures = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  landingPage: LandingPage;
  runtimeMonitor: RuntimeMonitor;
  initialUrl?: string;
  targetPage?: Page;
};

export class CustomWorld extends World implements Partial<BddWorldFixtures> {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  landingPage?: LandingPage;
  runtimeMonitor?: RuntimeMonitor;
  initialUrl?: string;
  targetPage?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

export function getWorldFixtures(world: CustomWorld): BddWorldFixtures {
  const { browser, context, page, landingPage, runtimeMonitor } = world;

  if (!browser || !context || !page || !landingPage || !runtimeMonitor) {
    throw new Error('BDD world fixtures are not initialized');
  }

  return {
    browser,
    context,
    page,
    landingPage,
    runtimeMonitor,
    initialUrl: world.initialUrl,
    targetPage: world.targetPage
  };
}

setWorldConstructor(CustomWorld);
