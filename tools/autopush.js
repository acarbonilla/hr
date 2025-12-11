#!/usr/bin/env node

const { execSync } = require("child_process");

const run = (cmd, options = {}) => execSync(cmd, { stdio: "inherit", ...options });

const log = (msg) => console.log(msg);

try {
  log("Checking changes...");
  const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();

  if (!status) {
    log("No changes to commit");
    process.exit(0);
  }

  log("Staging files...");
  run("git add .");

  const timestamp = new Date().toISOString();
  const message = `Auto-commit: ${timestamp}`;

  log("Committing...");
  run(`git commit -m "${message}"`);

  log("Pushing...");
  run("git push -u origin main");

  log("Done.");
} catch (error) {
  console.error("Autopush failed:", error.message);
  process.exit(1);
}
