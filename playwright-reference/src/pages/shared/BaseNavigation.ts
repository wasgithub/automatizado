import type { Page } from '@playwright/test';

export class BaseNavigation {
  constructor(protected readonly page: Page) {}
  async openHome(): Promise<void> {
    await this.page.goto('/');
  }
}
