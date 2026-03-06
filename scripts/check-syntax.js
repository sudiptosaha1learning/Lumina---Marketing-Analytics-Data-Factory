import { execSync } from "child_process";
import path from "path";

const projectDir = "/vercel/share/v0-project";

try {
  console.log("[v0] Running tsc type check...");
  const result = execSync(
    `cd ${projectDir} && npx tsc --noEmit --skipLibCheck 2>&1 || true`,
    { encoding: "utf8", timeout: 30000 }
  );
  console.log("[v0] TSC output:\n" + (result || "(no errors)"));
} catch (err) {
  console.log("[v0] TSC error:", err.message);
}

try {
  console.log("[v0] Checking dashboard-data.ts with node parse...");
  // Strip TS-specific syntax and check basic JS structure
  const result = execSync(
    `cd ${projectDir} && node --input-type=module -e "
import { readFileSync } from 'fs';
const src = readFileSync('./lib/dashboard-data.ts', 'utf8');
// Count braces
let opens = (src.match(/\\{/g) || []).length;
let closes = (src.match(/\\}/g) || []).length;
console.log('[v0] Open braces:', opens, 'Close braces:', closes, 'Balance:', opens - closes);
// Count brackets
let opensq = (src.match(/\\[/g) || []).length;
let closesq = (src.match(/\\]/g) || []).length;
console.log('[v0] Open brackets:', opensq, 'Close brackets:', closesq, 'Balance:', opensq - closesq);
// Check backticks
let backticks = (src.match(/\\\`/g) || []).length;
console.log('[v0] Backticks:', backticks, 'Even?', backticks % 2 === 0);
" 2>&1`,
    { encoding: "utf8", timeout: 15000 }
  );
  console.log(result);
} catch (err) {
  console.log("[v0] Parse check error:", err.message);
}

try {
  console.log("[v0] Checking ModelMosaic.tsx brace balance...");
  const result = execSync(
    `cd ${projectDir} && node --input-type=module -e "
import { readFileSync } from 'fs';
const src = readFileSync('./components/dashboard/ModelMosaic.tsx', 'utf8');
let opens = (src.match(/\\{/g) || []).length;
let closes = (src.match(/\\}/g) || []).length;
console.log('[v0] Open braces:', opens, 'Close braces:', closes, 'Balance:', opens - closes);
let backticks = (src.match(/\\\`/g) || []).length;
console.log('[v0] Backticks:', backticks, 'Even?', backticks % 2 === 0);
" 2>&1`,
    { encoding: "utf8", timeout: 15000 }
  );
  console.log(result);
} catch (err) {
  console.log("[v0] ModelMosaic check error:", err.message);
}
