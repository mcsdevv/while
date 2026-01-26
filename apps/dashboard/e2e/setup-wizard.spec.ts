import { expect, test } from "@playwright/test";

test.describe("Setup Wizard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the setup status API to start fresh
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: {
            configured: false,
            connected: false,
            calendarSelected: false,
          },
          notion: {
            configured: false,
            databaseSelected: false,
            databaseName: null,
          },
          fieldMapping: {
            configured: false,
          },
        }),
      });
    });
  });

  test("displays welcome step on initial load", async ({ page }) => {
    await page.goto("/setup");

    // Check welcome step is visible
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
    await expect(page.getByText("Get started")).toBeVisible();

    // Check progress indicator shows step 1 as active
    const progressButtons = page.locator("nav ol li button");
    await expect(progressButtons.first()).toHaveClass(/bg-primary/);
  });

  test("navigates through wizard steps", async ({ page }) => {
    await page.goto("/setup");

    // Step 1: Welcome - click Get Started
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
    await page.getByRole("button", { name: "Get Started" }).click();

    // Step 2: Google
    await expect(page.getByRole("heading", { name: "Google" })).toBeVisible();

    // Go back to Welcome
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  });

  test("shows progress indicator correctly", async ({ page }) => {
    await page.goto("/setup");

    // Check all 5 steps are visible
    const stepNames = ["Welcome", "Google", "Notion", "Field Mapping", "Test"];
    for (const name of stepNames) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }

    // Check step numbers are displayed
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator(`nav button:has-text("${i}")`)).toBeVisible();
    }
  });

  test("disables future steps until current step is completed", async ({ page }) => {
    await page.goto("/setup");

    // Steps 3, 4, 5 should be disabled (can't skip ahead more than 1 step)
    const step3Button = page.locator("nav ol li").nth(2).locator("button");
    const step4Button = page.locator("nav ol li").nth(3).locator("button");
    const step5Button = page.locator("nav ol li").nth(4).locator("button");

    await expect(step3Button).toBeDisabled();
    await expect(step4Button).toBeDisabled();
    await expect(step5Button).toBeDisabled();
  });

  test("shows loading skeleton while fetching status", async ({ page }) => {
    // Delay the API response
    await page.route("**/api/setup/status", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: false, connected: false, calendarSelected: false },
          notion: { configured: false, databaseSelected: false, databaseName: null },
          fieldMapping: { configured: false },
        }),
      });
    });

    await page.goto("/setup");

    // Should show skeleton while loading
    await expect(page.locator(".animate-pulse").first()).toBeVisible();
  });
});

test.describe("Setup Wizard - Google Step", () => {
  test.beforeEach(async ({ page }) => {
    // Mock status API to show Google step (not yet connected)
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: true, connected: false, calendarSelected: false },
          notion: { configured: false, databaseSelected: false, databaseName: null },
          fieldMapping: { configured: false },
        }),
      });
    });
  });

  test("shows Sign in with Google button on step 2", async ({ page }) => {
    await page.goto("/setup");

    // Navigate to Google step
    await page.getByRole("button", { name: "Get Started" }).click();

    // Check Google step is visible with sign-in button (no credential fields)
    await expect(page.getByRole("heading", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in with Google/i })).toBeVisible();
  });

  test("shows calendar selection after Google sign-in", async ({ page }) => {
    // Mock status API to show Google connected
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: true, connected: true, calendarSelected: false },
          notion: { configured: false, databaseSelected: false, databaseName: null },
          fieldMapping: { configured: false },
        }),
      });
    });

    // Mock calendar list API
    await page.route("**/api/setup/google/calendars", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            calendars: [
              { id: "primary", name: "Personal", primary: true },
              { id: "work@group.calendar.google.com", name: "Work", primary: false },
            ],
            selectedCalendarId: null,
          }),
        });
      }
    });

    await page.goto("/setup");
    await page.getByRole("button", { name: "Get Started" }).click();

    // Check calendar selection is visible
    await expect(page.getByRole("heading", { name: "Google" })).toBeVisible();
    await expect(page.getByText(/Google Calendar connected/i)).toBeVisible();
    await expect(page.getByText(/Select Calendar to Sync/i)).toBeVisible();
  });
});

test.describe("Setup Wizard - Notion Step", () => {
  test.beforeEach(async ({ page }) => {
    // Mock status API to show Notion step
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: true, connected: true, calendarSelected: true },
          notion: { configured: false, databaseSelected: false, databaseName: null },
          fieldMapping: { configured: false },
        }),
      });
    });
  });

  test("shows Notion token input on step 3", async ({ page }) => {
    await page.goto("/setup");

    // Should auto-advance to Notion step
    await expect(page.getByRole("heading", { name: "Notion" })).toBeVisible();
    await expect(page.getByLabel(/API Token/i)).toBeVisible();
  });

  test("shows error for invalid API token", async ({ page }) => {
    // Mock Notion validation to fail
    await page.route("**/api/setup/notion", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid API token" }),
      });
    });

    await page.goto("/setup");

    // Fill in token
    await page.getByLabel(/API Token/i).fill("invalid-token");

    // Submit
    await page.getByRole("button", { name: /Validate/i }).click();

    // Check error is displayed
    await expect(page.getByText(/Invalid API token/i)).toBeVisible();
  });
});

test.describe("Setup Wizard - Field Mapping Step", () => {
  test.beforeEach(async ({ page }) => {
    // Mock status API to show Field Mapping step
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: true, connected: true, calendarSelected: true },
          notion: { configured: true, databaseSelected: true, databaseName: "Test DB" },
          fieldMapping: { configured: false },
        }),
      });
    });

    // Mock field mapping API
    await page.route("**/api/setup/field-mapping", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            properties: ["Name", "Date", "Notes", "Location", "Event ID", "Remind"],
            currentMapping: {
              title: "Name",
              date: "Date",
              description: "",
              location: "",
              gcalEventId: "",
              reminders: "",
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });
  });

  test("shows field mapping interface on step 4", async ({ page }) => {
    await page.goto("/setup");

    // Should auto-advance to Field Mapping step
    await expect(page.getByRole("heading", { name: "Field Mapping" })).toBeVisible();
  });

  test("requires title and date fields", async ({ page }) => {
    await page.goto("/setup");

    // Check required labels
    await expect(page.getByText(/Title/i).first()).toBeVisible();
    await expect(page.getByText(/Date/i).first()).toBeVisible();
  });
});

test.describe("Setup Wizard - Test Step", () => {
  test.beforeEach(async ({ page }) => {
    // Mock status API to show Test step
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: true, connected: true, calendarSelected: true },
          notion: { configured: true, databaseSelected: true, databaseName: "Test DB" },
          fieldMapping: { configured: true },
        }),
      });
    });
  });

  test("shows test connections button on step 5", async ({ page }) => {
    await page.goto("/setup");

    // Navigate to test step
    await page.locator("nav ol li").nth(4).locator("button").click();

    await expect(page.getByRole("heading", { name: "Test" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Test Connections/i })).toBeVisible();
  });

  test("shows success when all tests pass", async ({ page }) => {
    // Mock test API to succeed
    await page.route("**/api/setup/test", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          results: [
            { service: "Google Calendar", success: true, message: "Connected" },
            { service: "Notion", success: true, message: "Connected" },
          ],
        }),
      });
    });

    await page.goto("/setup");
    await page.locator("nav ol li").nth(4).locator("button").click();

    // Run tests
    await page.getByRole("button", { name: /Test Connections/i }).click();

    // Check success indicators
    await expect(page.getByText(/Google Calendar.*Connected/i)).toBeVisible();
    await expect(page.getByText(/Notion.*Connected/i)).toBeVisible();
  });

  test("shows failure when tests fail", async ({ page }) => {
    // Mock test API to fail
    await page.route("**/api/setup/test", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          results: [
            { service: "Google Calendar", success: false, message: "Failed to connect" },
            { service: "Notion", success: true, message: "Connected" },
          ],
        }),
      });
    });

    await page.goto("/setup");
    await page.locator("nav ol li").nth(4).locator("button").click();

    // Run tests
    await page.getByRole("button", { name: /Test Connections/i }).click();

    // Check failure indicator
    await expect(page.getByText(/Failed to connect/i)).toBeVisible();
  });
});

test.describe("Setup Wizard - Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("displays correctly on mobile viewport", async ({ page }) => {
    await page.route("**/api/setup/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          setupComplete: false,
          google: { configured: false, connected: false, calendarSelected: false },
          notion: { configured: false, databaseSelected: false, databaseName: null },
          fieldMapping: { configured: false },
        }),
      });
    });

    await page.goto("/setup");

    // Check page loads without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance

    // Check welcome step is visible
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  });
});
