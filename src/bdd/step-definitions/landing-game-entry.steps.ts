import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { getWorldFixtures, type CustomWorld } from '../custom-world';
import { expectCanvasOrNavigation, getAttachedCanvas, hasWebGLContext } from '../../utils/webgl';

Given('I open the KickAndBoom landing page', async function (this: CustomWorld) {
  const { landingPage } = getWorldFixtures(this);

  await landingPage.open();
});

Then('the landing page is ready to start the game', async function (this: CustomWorld) {
  const { landingPage } = getWorldFixtures(this);

  await landingPage.expectLoaded();
});

When('I start the Play flow', async function (this: CustomWorld) {
  const { landingPage } = getWorldFixtures(this);

  this.initialUrl = landingPage.page.url();
  this.targetPage = await landingPage.clickPlayCta();
});

Then('the game entry flow should be opened', async function (this: CustomWorld) {
  const { page, initialUrl, targetPage } = getWorldFixtures(this);

  await expectCanvasOrNavigation(targetPage ?? page, initialUrl ?? page.url());
});

Then('the game canvas should expose WebGL when available', async function (this: CustomWorld) {
  const { page, targetPage } = getWorldFixtures(this);
  const canvas = await getAttachedCanvas(targetPage ?? page);

  if (!canvas) {
    return;
  }

  await expect
    .poll(() => hasWebGLContext(canvas), {
      message: 'Expected attached canvas to expose a WebGL context',
      timeout: 30_000
    })
    .toBe(true);
});

Then('there should be no blocking runtime issues', async function (this: CustomWorld) {
  const { runtimeMonitor } = getWorldFixtures(this);

  expect(runtimeMonitor.getBlockingIssues()).toEqual([]);
});
