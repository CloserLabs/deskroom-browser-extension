import { expect, test } from "./fixtures";

test.describe("Given Chrome Extension worked", () => {
  test("When I drag a text, Then a tooltip should show up", async ({
    page,
  }) => {
    await page.goto("https://plasmo.com");
    // drag a text to trigger the tooltip
    await page
      .locator("main > div > p")
      .dragTo(page.locator("main > div > div.mt-12"));
    // wait for the tooltip to show up
    await page.waitForSelector(".tooltip");
    // assert the tooltip is visible
    await expect(page.locator(".tooltip")).toBeVisible();
  });
});
