#!/usr/bin/env node
/**
 * Denver CLI - Setup tools for Denver Calendar Sync
 *
 * Usage:
 *   denver setup notion  - Configure Notion integration
 *   denver setup google  - Configure Google Calendar (coming soon)
 */

import { Command } from "commander";
import { setupNotion } from "./commands/setup-notion.js";

const program = new Command();

program.name("denver").description("CLI tools for Denver Calendar Sync setup").version("0.1.0");

const setup = program.command("setup").description("Setup integrations");

setup
  .command("notion")
  .description("Configure Notion integration")
  .action(async () => {
    await setupNotion();
  });

setup
  .command("google")
  .description("Configure Google Calendar integration (coming soon)")
  .action(() => {
    console.log(
      "Google Calendar setup via CLI is not yet implemented.\nPlease use the web UI at http://localhost:3000/setup",
    );
  });

program.parse();
