import { test, expect } from '../../src/fixtures/test';
import { expectCanvasOrNavigation, getAttachedCanvas, hasWebGLContext } from '../../src/utils/webgl';

test.describe('@smoke KickAndBoom landing and game entry', () => {
  test('opens landing page and starts the Play flow', async ({ landingPage, runtimeMonitor }) => {
    await landingPage.open();
    await landingPage.expectLoaded();

    const initialUrl = landingPage.page.url();
    const targetPage = await landingPage.clickPlayCta();

    await expectCanvasOrNavigation(targetPage, initialUrl);

    const canvas = await getAttachedCanvas(targetPage);
    if (canvas) {
      await expect
        .poll(() => hasWebGLContext(canvas), {
          message: 'Expected attached canvas to expose a WebGL context',
          timeout: 30_000
        })
        .toBe(true);
    }

    expect(runtimeMonitor.getBlockingIssues()).toEqual([]);
  });
});
