import { parseArgs, runFetch } from "./run.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = await runFetch(args);
  const w = Math.max(4, ...rows.map((r) => r.file.length));
  console.log(`\n${"file".padEnd(w)}  ${"bytes".padStart(10)}  ${"globals".padStart(10)}  status`);
  for (const r of rows) {
    console.log(`${r.file.padEnd(w)}  ${String(r.bytes).padStart(10)}  ${String(r.globals).padStart(10)}  ${r.status}`);
  }
  if (rows.length && rows.every((r) => r.status === "up to date")) console.log("\nEverything up to date.");
}

main().catch((e) => {
  console.error(`fetch failed: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
