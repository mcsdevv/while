#!/usr/bin/env tsx
/**
 * Build a standalone version of the dashboard for the template repository.
 *
 * This script:
 * 1. Copies apps/dashboard to the output directory
 * 2. Copies packages/ui/src to shared/ui
 * 3. Rewrites imports from @while/ui to @/shared/ui
 * 4. Merges UI dependencies into package.json
 * 5. Removes workspace: protocol references
 * 6. Updates tsconfig paths
 * 7. Generates a standalone README
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const OUTPUT_DIR = join(ROOT_DIR, "dist-standalone");

const UI_DEPENDENCIES: Record<string, string> = {
  "@base-ui/react": "^1.1.0",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "tailwind-variants": "^3.2.2",
};

// Dependencies that are hoisted in the monorepo but needed standalone
const HOISTED_DEPENDENCIES: Record<string, string> = {
  "react-is": "^19.0.0", // Peer dep of recharts
};

function log(message: string): void {
  console.log(`[build-standalone] ${message}`);
}

function cleanOutput(): void {
  if (existsSync(OUTPUT_DIR)) {
    log("Cleaning output directory...");
    rmSync(OUTPUT_DIR, { recursive: true });
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

function copyDashboard(): void {
  log("Copying dashboard...");
  const dashboardDir = join(ROOT_DIR, "apps/dashboard");

  const excludes = [
    "node_modules",
    ".next",
    ".turbo",
    "coverage",
    "test-results",
    "playwright-report",
  ];

  cpSync(dashboardDir, OUTPUT_DIR, {
    recursive: true,
    filter: (src) => {
      const relativePath = relative(dashboardDir, src);
      return !excludes.some((ex) => relativePath === ex || relativePath.startsWith(`${ex}/`));
    },
  });
}

function copyUIPackage(): void {
  log("Copying UI package to shared/ui...");
  const uiSrcDir = join(ROOT_DIR, "packages/ui/src");
  const targetDir = join(OUTPUT_DIR, "shared/ui");

  mkdirSync(targetDir, { recursive: true });
  cpSync(uiSrcDir, targetDir, { recursive: true });
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (entry !== "node_modules" && entry !== ".next") {
          walk(fullPath);
        }
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function rewriteImports(): void {
  log("Rewriting @while/ui imports...");
  const files = getAllFiles(OUTPUT_DIR, [".ts", ".tsx", ".js", ".jsx"]);

  let totalReplacements = 0;

  for (const file of files) {
    let content = readFileSync(file, "utf-8");
    let modified = false;

    // Replace import statements: from "@while/ui" -> from "@/shared/ui"
    let newContent = content
      .replace(/from\s+["']@while\/ui["']/g, () => {
        modified = true;
        totalReplacements++;
        return 'from "@/shared/ui"';
      })
      .replace(/from\s+["']@while\/ui\/([^"']+)["']/g, (_, component) => {
        modified = true;
        totalReplacements++;
        return `from "@/shared/ui/${component}"`;
      });

    // Replace vi.mock("@while/ui") patterns in test files
    newContent = newContent.replace(/vi\.mock\(["']@while\/ui["']/g, () => {
      modified = true;
      totalReplacements++;
      return 'vi.mock("@/shared/ui"';
    });

    if (modified) {
      writeFileSync(file, newContent);
    }
  }

  log(`  Rewrote ${totalReplacements} imports`);
}

function updateNextConfig(): void {
  log("Updating next.config.ts...");
  const configPath = join(OUTPUT_DIR, "next.config.ts");

  if (!existsSync(configPath)) {
    return;
  }

  let content = readFileSync(configPath, "utf-8");

  // Remove @while/ui from transpilePackages array
  content = content.replace(/transpilePackages:\s*\[["']@while\/ui["']\],?\n?/g, "");

  // Also handle if it's in a multi-item array
  content = content.replace(/["']@while\/ui["'],?\s*/g, "");

  writeFileSync(configPath, content);
}

function updatePackageJson(): void {
  log("Updating package.json...");
  const pkgPath = join(OUTPUT_DIR, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  // Remove @while/ui dependency
  delete pkg.dependencies["@while/ui"];

  // Add UI dependencies
  for (const [name, version] of Object.entries(UI_DEPENDENCIES)) {
    if (!pkg.dependencies[name]) {
      pkg.dependencies[name] = version;
    }
  }

  // Add hoisted dependencies
  for (const [name, version] of Object.entries(HOISTED_DEPENDENCIES)) {
    if (!pkg.dependencies[name]) {
      pkg.dependencies[name] = version;
    }
  }

  // Remove workspace: protocol (convert to actual versions if needed)
  for (const [name, version] of Object.entries(pkg.dependencies)) {
    if (typeof version === "string" && version.startsWith("workspace:")) {
      // For now, just remove workspace packages that aren't @while/ui
      // In production, you'd want to resolve these to actual versions
      delete pkg.dependencies[name];
    }
  }

  // Update package name for standalone
  pkg.name = "while-dashboard";

  // Remove turbo references from scripts if any
  for (const [script, command] of Object.entries(pkg.scripts)) {
    if (typeof command === "string" && command.includes("turbo")) {
      // Remove turbo-specific scripts
      delete pkg.scripts[script];
    }
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

function updateTsConfig(): void {
  log("Updating tsconfig.json...");
  const tsconfigPath = join(OUTPUT_DIR, "tsconfig.json");
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));

  // Ensure paths includes shared/ui mapping
  tsconfig.compilerOptions.paths = {
    ...tsconfig.compilerOptions.paths,
    "@/*": ["./*"],
  };

  writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n");
}

function generateReadme(): void {
  log("Generating standalone README...");

  const readme = `# While Dashboard

Bidirectional, real-time sync between Notion calendar databases and Google Calendar.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fwhile-dashboard-template&env=NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,AUTHORIZED_EMAILS&envDescription=Required%20environment%20variables%20for%20While&envLink=https%3A%2F%2Fwhile.so%2Fdocs%2Fsetup%2Fvercel&project-name=while&repository-name=while)

## Quick Start

1. Click **Deploy with Vercel** above
2. Configure environment variables
3. Complete setup wizard at \`/setup\`
4. Start syncing!

## Prerequisites

- **Google Cloud Project** with Calendar API enabled ([Guide](https://while.so/docs/setup/google))
- **Notion Integration** ([Guide](https://while.so/docs/setup/notion))
- **Vercel Account** (Redis storage included via Vercel Marketplace)

## Local Development

\`\`\`bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start dev server
pnpm dev
\`\`\`

## Environment Variables

See \`.env.example\` for all configuration options.

| Variable | Required | Description |
|----------|----------|-------------|
| \`GOOGLE_CLIENT_ID\` | Yes | Google OAuth client ID |
| \`GOOGLE_CLIENT_SECRET\` | Yes | Google OAuth client secret |
| \`NEXTAUTH_SECRET\` | Yes | Session encryption key |
| \`AUTHORIZED_EMAILS\` | Yes | Allowed email patterns (e.g., \`*@company.com\`) |

## Documentation

Full documentation: [while.so/docs](https://while.so/docs)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*This is a standalone deployment template. For the full monorepo with marketing site and development tools, see [github.com/mcsdevv/while](https://github.com/mcsdevv/while).*
`;

  writeFileSync(join(OUTPUT_DIR, "README.md"), readme);
}

function removeMonorepoFiles(): void {
  log("Removing monorepo-specific files...");

  const filesToRemove = [
    "turbo.json",
    ".turbo",
    "vercel.json", // Dashboard has its own vercel.json for crons
  ];

  for (const file of filesToRemove) {
    const filePath = join(OUTPUT_DIR, file);
    if (existsSync(filePath)) {
      rmSync(filePath, { recursive: true });
    }
  }
}

function copyLicense(): void {
  log("Copying LICENSE...");
  const licensePath = join(ROOT_DIR, "LICENSE");
  if (existsSync(licensePath)) {
    cpSync(licensePath, join(OUTPUT_DIR, "LICENSE"));
  }
}

function main(): void {
  log("Building standalone dashboard...");
  log(`Output directory: ${OUTPUT_DIR}`);

  cleanOutput();
  copyDashboard();
  copyUIPackage();
  rewriteImports();
  updateNextConfig();
  updatePackageJson();
  updateTsConfig();
  generateReadme();
  removeMonorepoFiles();
  copyLicense();

  log("Done! Standalone dashboard built at:");
  log(`  ${OUTPUT_DIR}`);
  log("");
  log("To test locally:");
  log(`  cd ${relative(process.cwd(), OUTPUT_DIR)}`);
  log("  pnpm install");
  log("  pnpm build");
}

main();
