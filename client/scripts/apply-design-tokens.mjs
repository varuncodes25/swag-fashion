/**
 * One-time migration: map hardcoded Tailwind colors → index.css design tokens.
 * Run: node scripts/apply-design-tokens.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "..", "src");

/** Order: longer / more specific patterns first */
const REPLACEMENTS = [
  ["hover:from-blue-700 hover:to-indigo-700", "hover:from-primary/90 hover:to-primary/80"],
  ["hover:from-pink-700 hover:to-rose-700", "hover:from-primary/90 hover:to-primary/80"],
  ["from-blue-600 to-indigo-600", "from-primary to-primary/90"],
  ["from-blue-500 to-indigo-600", "from-primary to-primary/90"],
  ["from-blue-500 to-blue-600", "from-primary to-primary/90"],
  ["from-indigo-600 to-purple-600", "from-primary to-primary/85"],
  ["from-pink-600 to-rose-600", "from-primary to-primary/85"],
  ["from-pink-500 to-red-500", "from-primary to-primary/90"],
  ["from-pink-500 to-rose-500", "from-primary to-primary/90"],
  ["from-green-500 to-emerald-600", "from-success to-success/90"],
  ["from-blue-500 to-indigo-500", "from-primary to-primary/90"],

  ["focus:ring-blue-500", "focus:ring-primary"],
  ["focus:border-blue-500", "focus:border-primary"],
  ["ring-blue-500", "ring-primary"],
  ["border-blue-600", "border-primary"],
  ["border-blue-500", "border-primary"],

  ["hover:bg-blue-700", "hover:bg-primary/90"],
  ["hover:bg-blue-600", "hover:bg-primary/90"],
  ["hover:bg-indigo-700", "hover:bg-primary/90"],
  ["bg-blue-600", "bg-primary"],
  ["bg-blue-500", "bg-primary"],
  ["text-blue-800", "text-info"],
  ["text-blue-700", "text-primary"],
  ["text-blue-600", "text-primary"],
  ["dark:text-blue-400", "dark:text-primary"],
  ["dark:text-blue-300", "dark:text-primary"],
  ["bg-blue-50", "bg-primary/10"],
  ["dark:bg-blue-900/30", "dark:bg-primary/20"],
  ["dark:bg-blue-950/30", "dark:bg-primary/15"],
  ["border-blue-200", "border-primary/25"],
  ["dark:border-blue-800", "dark:border-primary/30"],

  ["text-pink-600", "text-primary"],
  ["dark:text-pink-400", "dark:text-primary"],
  ["text-pink-700", "text-primary"],
  ["bg-pink-600", "bg-primary"],
  ["hover:bg-pink-700", "hover:bg-primary/90"],
  ["bg-pink-50", "bg-primary/10"],
  ["dark:bg-pink-900/20", "dark:bg-primary/15"],
  ["border-pink-500", "border-primary"],

  ["text-gray-900 dark:text-white", "text-foreground"],
  ["text-gray-800 dark:text-white", "text-foreground"],
  ["text-gray-900 dark:text-gray-100", "text-foreground"],
  ["text-gray-600 dark:text-gray-400", "text-muted-foreground"],
  ["text-gray-600 dark:text-gray-300", "text-muted-foreground"],
  ["text-gray-500 dark:text-gray-400", "text-muted-foreground"],
  ["text-gray-500 dark:text-gray-300", "text-muted-foreground"],
  ["text-gray-400 dark:text-gray-500", "text-muted-foreground"],

  ["bg-white dark:bg-gray-800", "bg-card"],
  ["bg-white dark:bg-gray-900", "bg-card"],
  ["bg-gray-50 dark:bg-gray-900", "bg-muted/30 dark:bg-card"],
  ["bg-gray-50 dark:bg-gray-800", "bg-muted/40"],
  ["bg-gray-100 dark:bg-gray-800", "bg-muted"],
  ["bg-gray-100 dark:bg-zinc-900", "bg-muted"],

  ["border-gray-200 dark:border-gray-700", "border-border"],
  ["border-gray-200 dark:border-gray-800", "border-border"],
  ["border-gray-300 dark:border-gray-600", "border-border"],
  ["border-gray-300 dark:border-gray-700", "border-border"],

  ["text-green-600 dark:text-green-400", "text-success"],
  ["text-green-700 dark:text-green-400", "text-success"],
  ["text-emerald-600 dark:text-emerald-400", "text-success"],

  ["text-red-600 dark:text-red-400", "text-destructive"],
  ["text-red-800 dark:text-red-300", "text-destructive"],

  ["bg-zinc-900 dark:bg-zinc-950", "bg-card"],
  ["bg-zinc-800 dark:bg-zinc-900", "bg-card"],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === "node_modules") continue;
      walk(p, files);
    } else if (/\.(jsx|tsx|js|ts)$/.test(name)) {
      files.push(p);
    }
  }
  return files;
}

let totalFiles = 0;
for (const file of walk(srcDir)) {
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  for (const [from, to] of REPLACEMENTS) {
    if (from !== to) c = c.split(from).join(to);
  }
  if (c !== orig) {
    fs.writeFileSync(file, c);
    totalFiles++;
    console.log("updated:", path.relative(srcDir, file));
  }
}
console.log("Done. Files changed:", totalFiles);
