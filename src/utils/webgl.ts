import { expect, type Locator, type Page } from '@playwright/test';

export async function getAttachedCanvas(page: Page): Promise<Locator | null> {
  const canvas = page.locator('canvas').first();
  return (await canvas.count()) > 0 ? canvas : null;
}

export async function getVisibleCanvas(page: Page): Promise<Locator | null> {
  const canvases = page.locator('canvas');
  const count = await canvases.count();

  for (let index = 0; index < count; index += 1) {
    const canvas = canvases.nth(index);
    if (await canvas.isVisible().catch(() => false)) {
      return canvas;
    }
  }

  return null;
}

export async function hasWebGLContext(canvas: Locator): Promise<boolean> {
  return canvas.evaluate((element) => {
    const htmlCanvas = element as HTMLCanvasElement;

    return Boolean(
      htmlCanvas.getContext('webgl2') ||
        htmlCanvas.getContext('webgl') ||
        htmlCanvas.getContext('experimental-webgl')
    );
  });
}

export async function expectCanvasOrNavigation(page: Page, initialUrl: string): Promise<void> {
  await expect
    .poll(
      async () => {
        const hasNavigated = page.url() !== initialUrl;
        const hasCanvas = (await page.locator('canvas').count()) > 0;
        const hasIframe = (await page.locator('iframe').count()) > 0;

        return hasNavigated || hasCanvas || hasIframe;
      },
      {
        message: 'Expected Play CTA to open a game canvas or navigate to the next flow',
        timeout: 45_000
      }
    )
    .toBe(true);
}
