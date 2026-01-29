#!/usr/bin/env tsx
/**
 * Starts Next.js dev server with incremental port fallback.
 * If the configured port is in use, tries next available port.
 *
 * Usage: PORT=3000 tsx scripts/dev-with-port-fallback.ts
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";

const DEFAULT_PORT = Number.parseInt(process.env.PORT || "3000", 10);
const MAX_ATTEMPTS = 10;

if (Number.isNaN(DEFAULT_PORT) || DEFAULT_PORT < 1 || DEFAULT_PORT > 65535) {
  console.error(`Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    // Bind to all interfaces (same as Next.js) to properly detect conflicts
    server.listen(port);
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`Port ${port} in use, trying ${port + 1}...`);
  }
  throw new Error(`No available port found after ${MAX_ATTEMPTS} attempts`);
}

async function main() {
  const port = await findAvailablePort(DEFAULT_PORT);

  if (port !== DEFAULT_PORT) {
    console.log(`\n[dev] Using fallback port ${port} (${DEFAULT_PORT} was in use)\n`);
  }

  const child = spawn("npx", ["next", "dev", "--port", port.toString()], {
    stdio: "inherit",
  });

  // Forward signals to child for clean shutdown
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(signal, () => child.kill(signal));
  }

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
