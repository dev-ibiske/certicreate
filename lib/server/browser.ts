import puppeteer, { type Browser } from "puppeteer";

// Kept on globalThis because Next can load this module more than once (the
// instrumentation hook and route bundles), and there must be one Chrome.
const store = globalThis as typeof globalThis & {
  certificateBrowser?: Promise<Browser>;
};

/**
 * Returns the shared Chrome instance, launching it on first use. Requests open
 * their own page on it; Chrome is only relaunched after it disconnects.
 */
export function getBrowser(): Promise<Browser> {
  if (!store.certificateBrowser) {
    const launch = puppeteer
      .launch({
        headless: true,
        // Containers have no sandbox support and a tiny /dev/shm.
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      })
      .then((browser) => {
        browser.on("disconnected", () => {
          if (store.certificateBrowser === launch) store.certificateBrowser = undefined;
        });
        return browser;
      })
      .catch((error: unknown) => {
        if (store.certificateBrowser === launch) store.certificateBrowser = undefined;
        throw error;
      });
    store.certificateBrowser = launch;
  }
  return store.certificateBrowser;
}
