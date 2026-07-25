import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundledNode =
  "/Users/syn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";
const nuxtBinary = resolve(projectRoot, "node_modules/.bin/nuxt");
const requestedNode = process.env.NUXT_BUILD_NODE;
const nodeBinary =
  requestedNode || (existsSync(bundledNode) ? bundledNode : process.execPath);

const result = spawnSync(nodeBinary, [nuxtBinary, "build"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
