import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const action = readFileSync(new URL("../action.yml", import.meta.url), "utf8");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

for (const snippet of [
  "using: composite",
  "api-key:",
  "DELEGA_API_KEY: ${{ inputs.api-key }}",
  "npx --yes \"@delega-dev/cli@${DELEGA_CLI_VERSION}\"",
  "pull|push|status",
]) {
  assert.ok(action.includes(snippet), `action.yml should include ${snippet}`);
}

for (const snippet of [
  "secrets.DELEGA_API_KEY",
  "delega sync init --repo owner/name",
  "Closes-Delega: #<task-id>",
  "explicit conflict",
]) {
  assert.ok(readme.includes(snippet), `README should include ${snippet}`);
}

console.log("action metadata checks passed");
