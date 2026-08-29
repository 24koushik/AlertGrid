const fs = require("fs");
const path = require("path");

const files = [
  "client/src/pages/admin/views/AlertManagement.tsx",
  "client/src/pages/admin/views/Analytics.tsx",
  "client/src/pages/admin/views/AssistanceQueue.tsx",
  "client/src/pages/admin/views/TaskManagement.tsx",
  "client/src/pages/admin/views/VolunteerManagement.tsx",
  "client/src/pages/volunteer/views/VolunteerTasks.tsx",
  "client/src/pages/citizen/views/CitizenRequests.tsx",
];

let totalFixes = 0;

for (const f of files) {
  const fp = path.resolve(__dirname, f);
  if (!fs.existsSync(fp)) {
    console.log("SKIP (not found):", f);
    continue;
  }
  let content = fs.readFileSync(fp, "utf-8");
  // Replace escaped backtick sequences: \` -> `
  // The file literally has backslash-backtick
  const before = content;
  content = content.replace(/\\`/g, "`");
  content = content.replace(/\\\$/g, "$");
  if (content !== before) {
    fs.writeFileSync(fp, content, "utf-8");
    const fixes = before.length - content.length;
    console.log("FIXED:", f, "(removed escape chars)");
    totalFixes++;
  } else {
    console.log("OK (no escaped backticks):", f);
  }
}

console.log("\nTotal files fixed:", totalFixes);
