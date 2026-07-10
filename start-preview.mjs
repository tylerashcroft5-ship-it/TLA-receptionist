// Launches the production build via `next start` with cwd pinned to this
// project (avoids the Turbopack dev-compiler space-in-path bug). Run
// `npm run build` first. Used by the Claude preview launch config.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const nextBin = join(dir, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "start", "-p", "3100"], {
  cwd: dir,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
