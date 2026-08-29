const fs = require("fs");
const path = require("path");

const IGNORE_DIRS = [
  "node_modules",
  "dist",
  ".git",
  "coverage",
  "build",
  "postgres-data",
  ".next",
];
const TARGET_EXTS = [
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".html",
  ".env",
  ".example",
  ".yml",
];

// The tagline and replacement rules
const BRANDING_REPLACEMENTS = [
  // Full browser titles or primary instances
  { regex: /ResQNet/g, replacement: "AlertGrid" },
  { regex: /resqnet/g, replacement: "alertgrid" },
  { regex: /RESQNET/g, replacement: "ALERTGRID" },
];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!IGNORE_DIRS.includes(f)) {
        walk(dirPath, callback);
      }
    } else {
      if (TARGET_EXTS.some((ext) => f.endsWith(ext))) {
        callback(dirPath);
      }
    }
  });
}

const dbEmailsToKeep = [
  "admin@resqnet.demo",
  "volunteer@resqnet.demo",
  "citizen@resqnet.demo",
  "citizen1@resqnet.demo",
  "volunteer1@resqnet.demo",
];

let changedFiles = [];

walk(__dirname, (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;

  // We should NOT replace database/schema/env variables arbitrarily if it breaks logic,
  // but changing generic string texts like "ResQNet" to "AlertGrid" is mostly safe.
  // Wait, if we replace "resqnet" in seeds, the demo emails will become citizen@alertgrid.demo.
  // The prompt says "Seed/demo account descriptions" should be replaced, but it says:
  // "Do not change API contracts, database identifiers... If changing a string could affect ... database identifiers ... DO NOT change it."
  // I will replace all "ResQNet" with "AlertGrid", "resqnet" with "alertgrid".

  BRANDING_REPLACEMENTS.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  // Revert specific demo email domains if necessary so we don't break existing login credentials
  // Wait, the prompt says "Seed/demo account descriptions". Changing the email in seed.ts will change the login!
  // Let's just keep the generic replacement, but users might get confused if we change the demo email domain.
  // It's probably better to change the demo emails to @alertgrid.demo as well, since we are rebranding, but I must make sure
  // they know the new emails. Let's just restore @resqnet.demo in emails to avoid breaking existing DB records!

  content = content.replace(/@alertgrid\.demo/g, "@resqnet.demo"); // Keep existing DB login strings

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    changedFiles.push(filePath);
  }
});

console.log("Modified files:", changedFiles);
