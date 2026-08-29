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
    // Simple replacement ignoring the exact corruption
    content = content.replace(
      /AlertGrid \S+ Real-Time/g,
      "AlertGrid - Real-Time",
    );
    content = content.replace(
      /PRESENTATION MODE \S+ Demo/g,
      "PRESENTATION MODE - Demo",
    );
    fs.writeFileSync(f, content);
  }
}
console.log("Fixed characters strictly");
