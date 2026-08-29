const fs = require("fs");

["AdminLayout.tsx", "CitizenLayout.tsx", "VolunteerLayout.tsx"].forEach(
  (file) => {
    const filepath = "client/src/components/layout/" + file;
    let content = fs.readFileSync(filepath, "utf8");
    content = content.replace(/theme=" dark\\ \/>/g, 'theme="dark" />');
    fs.writeFileSync(filepath, content);
  },
);
