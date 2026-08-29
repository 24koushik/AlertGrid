const fs = require("fs");

const files = [
  "client/index.html",
  "client/src/components/layout/AdminLayout.tsx",
  "client/src/components/layout/CitizenLayout.tsx",
  "client/src/components/layout/VolunteerLayout.tsx",
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, "utf8");
    content = content.replace(/\?\"/g, "—");
    content = content.replace(/\?"/g, "—");
    fs.writeFileSync(f, content);
  }
}
console.log("Fixed characters");
