// Placeholder BrowseTheWeb ability for UI automation (Playwright/Cypress wrapper)
export class BrowseTheWeb {
  // Intentionally minimal: real implementation would wrap Playwright's Page
  constructor(private options?: any) {}

  async navigate(url: string) {
    throw new Error('BrowseTheWeb.navigate not implemented. Install Playwright and implement BrowseTheWeb.');
  }

  // Add other helpers when implementing UI tests
}
