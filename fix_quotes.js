const fs = require("fs");
["AdminLayout.tsx", "CitizenLayout.tsx", "VolunteerLayout.tsx"].forEach((f) => {
  let p = "client/src/components/layout/" + f;
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(/\\"/g, '"');
  fs.writeFileSync(p, c);
});
