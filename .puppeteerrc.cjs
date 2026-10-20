const { join } = require("path");

/**
 * Keeps the downloaded Chrome inside the project so it ships with the Render
 * build instead of living in a home-directory cache that the deploy drops.
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
