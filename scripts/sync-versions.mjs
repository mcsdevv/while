import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const version = process.argv[2];
if (!version) {
  console.error("Usage: node sync-versions.mjs <version>");
  process.exit(1);
}

const files = ["apps/web/package.json", "apps/dashboard/package.json"];

for (const file of files) {
  const path = join(process.cwd(), file);
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg.version = version;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Updated ${file} to version ${version}`);
}
