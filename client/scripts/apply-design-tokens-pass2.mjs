import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "..", "src");

const REPLACEMENTS = [
  ["from-indigo-500 to-purple-600", "from-primary to-primary/85"],
  ["from-violet-600 to-purple-600", "from-primary to-primary/85"],
  ["from-cyan-500 to-blue-500", "from-info to-info/90"],
  ["bg-indigo-600", "bg-primary"],
  ["hover:bg-indigo-700", "hover:bg-primary/90"],
  ["text-indigo-600", "text-primary"],
  ["dark:text-indigo-400", "dark:text-primary"],
  ["bg-indigo-50", "bg-primary/10"],
  ["dark:bg-indigo-900/30", "dark:bg-primary/20"],
  ["border-indigo-500", "border-primary"],
  ["ring-indigo-500", "ring-primary"],

  ["bg-purple-600", "bg-primary"],
  ["text-purple-600", "text-primary"],
  ["from-purple-500 to-indigo-600", "from-primary to-primary/90"],

  ["text-sky-600", "text-info"],
  ["dark:text-sky-400", "dark:text-info"],

  ["bg-orange-500", "bg-warning"],
  ["hover:bg-orange-600", "hover:bg-warning/90"],
  ["text-orange-600", "text-warning"],
  ["border-orange-500", "border-warning"],
  ["bg-orange-50", "bg-warning/15"],
  ["dark:bg-orange-900/20", "dark:bg-warning/15"],

  ["text-amber-600", "text-highlight"],
  ["bg-amber-500", "bg-highlight"],

  ["min-h-screen bg-gray-50", "min-h-screen bg-background"],
  ["min-h-screen bg-gray-100", "min-h-screen bg-background"],
  ["bg-gray-50 dark:bg-gray-900", "bg-background"],
  ["shadow-gray-900/50", "shadow-foreground/10"],
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

let n = 0;
for (const file of walk(srcDir)) {
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  for (const [from, to] of REPLACEMENTS) {
    if (from !== to) c = c.split(from).join(to);
  }
  if (c !== orig) {
    fs.writeFileSync(file, c);
    n++;
    console.log("updated:", path.relative(srcDir, file));
  }
}
console.log("Pass 2 files:", n);
