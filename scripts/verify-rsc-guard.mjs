/**
 * Unit checks for page cache header constants (no network).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const guard = readFileSync(join(root, "src/lib/rsc-document-guard.ts"), "utf8");
const proxy = readFileSync(join(root, "src/proxy.ts"), "utf8");
const config = readFileSync(join(root, "next.config.ts"), "utf8");

assert.match(guard, /CDN-Cache-Control/);
assert.match(guard, /no-store/);
assert.match(guard, /Surrogate-Control/);
assert.match(proxy, /applySafePageCacheHeaders/);
assert.match(config, /CDN-Cache-Control/);
assert.match(config, /_next\/static\/:path\*/);
assert.match(config, /immutable/);

console.log("rsc-guard: PASS");
