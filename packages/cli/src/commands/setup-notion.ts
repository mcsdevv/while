/**
 * Notion Setup Command
 *
 * Interactive CLI for setting up Notion integration.
 * Guides users through creating an integration and configuring the connection.
 */

import { confirm, input, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import * as fs from "node:fs";
import * as path from "node:path";
import { validateNotionToken, type NotionDatabase } from "../utils/notion-validator.js";

const NOTION_INTEGRATIONS_URL = "https://www.notion.so/my-integrations/new";

/**
 * Main setup command for Notion integration
 */
export async function setupNotion(): Promise<void> {
  console.log();
  console.log(chalk.bold.cyan("🔧 Notion Setup"));
  console.log(chalk.gray("═".repeat(50)));
  console.log();

  // Step 1: Open Notion integrations page
  console.log(chalk.bold("Step 1: Create Integration"));
  console.log();

  const shouldOpen = await confirm({
    message: "Open Notion integrations page in your browser?",
    default: true,
  });

  if (shouldOpen) {
    const spinner = ora("Opening browser...").start();
    await open(NOTION_INTEGRATIONS_URL);
    spinner.succeed("Browser opened to Notion integrations");
  }

  console.log();
  console.log(chalk.yellow("Create a new integration with these settings:"));
  console.log(chalk.gray("  • Name: Denver Calendar Sync (or any name)"));
  console.log(chalk.gray("  • Type: Internal"));
  console.log(chalk.gray("  • Capabilities: ✓ Read ✓ Update ✓ Insert"));
  console.log();

  await confirm({
    message: "Press Enter when you've created your integration...",
    default: true,
  });

  // Step 2: Get and validate token
  console.log();
  console.log(chalk.bold("Step 2: Enter Token"));
  console.log();

  let validationResult: Awaited<ReturnType<typeof validateNotionToken>> | null = null;

  while (!validationResult?.valid) {
    const apiToken = await password({
      message: "Paste your Internal Integration Secret:",
      mask: "*",
    });

    if (!apiToken || apiToken.length < 10) {
      console.log(chalk.red("Token seems too short. Please try again."));
      continue;
    }

    const spinner = ora("Validating token...").start();
    validationResult = await validateNotionToken(apiToken);

    if (validationResult.valid) {
      spinner.succeed(
        chalk.green(
          `Token valid! Found ${validationResult.databases.length} accessible database${
            validationResult.databases.length === 1 ? "" : "s"
          }.`,
        ),
      );

      if (validationResult.integrationName) {
        console.log(
          chalk.gray(
            `  Integration: ${validationResult.integrationName}` +
              (validationResult.workspaceName ? ` in ${validationResult.workspaceName}` : ""),
          ),
        );
      }
    } else {
      spinner.fail(chalk.red(`Invalid token: ${validationResult.error}`));
      console.log(chalk.gray("  Make sure you copied the full token starting with 'secret_'"));

      const retry = await confirm({
        message: "Try again?",
        default: true,
      });

      if (!retry) {
        console.log(chalk.yellow("\nSetup cancelled."));
        return;
      }

      validationResult = null;
    }
  }

  // Check if no databases are shared
  if (validationResult.databases.length === 0) {
    console.log();
    console.log(chalk.yellow("⚠️  No databases found!"));
    console.log(chalk.gray("You need to share a database with your integration:"));
    console.log(chalk.gray("  1. Open your Notion database"));
    console.log(chalk.gray('  2. Click "..." menu in the top right'));
    console.log(chalk.gray('  3. Select "Connections" → Add your integration'));
    console.log();

    const retry = await confirm({
      message: "Retry after sharing a database?",
      default: true,
    });

    if (retry) {
      return setupNotion(); // Restart the flow
    }

    console.log(
      chalk.yellow("\nSetup incomplete. Run this command again after sharing a database."),
    );
    return;
  }

  // Step 3: Select database
  console.log();
  console.log(chalk.bold("Step 3: Select Database"));
  console.log();

  const selectedDb = await select<NotionDatabase>({
    message: "Which database should sync with Google Calendar?",
    choices: validationResult.databases.map((db) => ({
      name: `📊 ${db.name}`,
      value: db,
      description: db.url,
    })),
  });

  console.log(chalk.green(`\n✓ Selected: ${selectedDb.name}`));

  // Step 4: Save configuration
  console.log();
  console.log(chalk.bold("Step 4: Save Configuration"));
  console.log();

  // Find .env.local file
  const envPath = findEnvFile();

  if (envPath) {
    const saveToEnv = await confirm({
      message: `Save to ${path.basename(envPath)}?`,
      default: true,
    });

    if (saveToEnv) {
      await saveToEnvFile(
        envPath,
        (validationResult as { databases: NotionDatabase[] } & { valid: true }).databases.find(
          (d) => d.id === selectedDb.id,
        )
          ? await password({
              message: "Re-enter your token to save (it was not stored):",
              mask: "*",
            })
          : "",
        selectedDb.id,
      );

      console.log(chalk.green(`\n✓ Configuration saved to ${path.basename(envPath)}`));
    }
  } else {
    console.log(chalk.yellow("No .env.local file found."));
    console.log(chalk.gray("\nAdd these to your environment:"));
    console.log(chalk.cyan(`  NOTION_API_TOKEN=<your-token>`));
    console.log(chalk.cyan(`  NOTION_DATABASE_ID=${selectedDb.id}`));
  }

  // Final instructions
  console.log();
  console.log(chalk.bold.green("✓ Notion setup complete!"));
  console.log();
  console.log(chalk.gray("Next steps:"));
  console.log(chalk.gray("  1. Run: bun run dev"));
  console.log(chalk.gray("  2. Open: http://localhost:3000/setup"));
  console.log(chalk.gray("  3. Complete field mapping in the web UI"));
  console.log();
}

/**
 * Find the .env.local file in the project
 */
function findEnvFile(): string | null {
  const possiblePaths = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "apps/dashboard/.env.local"),
    path.join(process.cwd(), ".env"),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      return envPath;
    }
  }

  // Create .env.local if none exists
  const defaultPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(path.dirname(defaultPath))) {
    return defaultPath;
  }

  return null;
}

/**
 * Save configuration to .env file
 */
async function saveToEnvFile(envPath: string, apiToken: string, databaseId: string): Promise<void> {
  let content = "";

  // Read existing content if file exists
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf-8");
  }

  // Update or add NOTION_API_TOKEN
  if (apiToken) {
    if (content.includes("NOTION_API_TOKEN=")) {
      content = content.replace(/NOTION_API_TOKEN=.*/g, `NOTION_API_TOKEN=${apiToken}`);
    } else {
      content += `\n# Notion Integration\nNOTION_API_TOKEN=${apiToken}`;
    }
  }

  // Update or add NOTION_DATABASE_ID
  if (content.includes("NOTION_DATABASE_ID=")) {
    content = content.replace(/NOTION_DATABASE_ID=.*/g, `NOTION_DATABASE_ID=${databaseId}`);
  } else {
    content += `\nNOTION_DATABASE_ID=${databaseId}`;
  }

  // Clean up multiple newlines
  content = content.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  fs.writeFileSync(envPath, content);
}
