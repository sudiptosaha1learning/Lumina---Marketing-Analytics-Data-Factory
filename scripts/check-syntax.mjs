// Quick syntax check — transpile dashboard-data.ts and report errors
import { execSync } from "child_process";
import { readFileSync } from "fs";

try {
  // Use node --input-type to check if the TS file at minimum has valid structure
  const result = execSync(
    "npx tsc --noEmit --strict false --skipLibCheck lib/dashboard-data.ts 2>&1 || true",
    { cwd: "/vercel/share/v0-project", encoding: "utf8" }
  );
  console.log("[v0] TSC output:", result || "(no errors)");
} catch (e) {
  console.log("[v0] Error:", e.message);
}

try {
  const result2 = execSync(
    "npx tsc --noEmit --strict false --skipLibCheck components/dashboard/ModelMosaic.tsx 2>&1 || true",
    { cwd: "/vercel/share/v0-project", encoding: "utf8" }
  );
  console.log("[v0] ModelMosaic TSC output:", result2 || "(no errors)");
} catch (e) {
  console.log("[v0] ModelMosaic Error:", e.message);
}
