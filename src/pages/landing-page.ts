import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../config/environment';

export class LandingPage {
  readonly page: Page;
  readonly playCta: Locator;
  readonly cookieAcceptButton: Locator;
  readonly ageConfirmButton: Locator;
  readonly visibleLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.playCta = page
      .getByRole('link', { name: /play\s*now|play/i })
      .or(page.getByRole('button', { name: /play\s*now|play/i }))
      .first();
    this.cookieAcceptButton = page.locator('button.cky-btn-accept:visible').first();
    this.ageConfirmButton = page.locator('button.age-confirmation-modal__btn--primary:visible').first();
    this.visibleLinks = page.locator('a:visible');
  }

  async open(): Promise<void> {
    await this.page.goto(env.baseUrl, { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfVisible();
    await this.confirmAgeIfVisible();
  }

  private async acceptCookiesIfVisible(): Promise<void> {
    await this.cookieAcceptButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);

    if (await this.cookieAcceptButton.isVisible().catch(() => false)) {
      await this.cookieAcceptButton.click({ force: true });
      await this.cookieAcceptButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
    }
  }

  private async confirmAgeIfVisible(): Promise<void> {
    await this.ageConfirmButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);

    if (await this.ageConfirmButton.isVisible().catch(() => false)) {
      await this.ageConfirmButton.click({ force: true });
      await this.ageConfirmButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
    }
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/kickandboom\.com\/dt\/?/);
    await expect(this.playCta).toBeVisible();
    await expect(this.playCta).toBeEnabled();
  }

  async clickPlayCta(): Promise<Page> {
    await this.acceptCookiesIfVisible();
    await this.confirmAgeIfVisible();

    const popupPromise = this.page
      .context()
      .waitForEvent('page', { timeout: 5_000 })
      .catch(() => null);

    await expect(this.playCta).toBeVisible();
    await expect(this.playCta).toBeEnabled();
    await this.playCta.click({ force: true }).catch(async () => {
      await this.playCta.evaluate((element) => (element as HTMLElement).click());
    });

    const popup = await popupPromise;
    const targetPage = popup ?? this.page;

    await targetPage.waitForLoadState('domcontentloaded').catch(() => undefined);
    return targetPage;
  }
}
