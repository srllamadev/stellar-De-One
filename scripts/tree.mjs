import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  cwd: root, encoding: "utf8",
}).trim().split(/\r?\n/).filter(Boolean);
const tree = {};
for (const file of [...new Set(files)].sort()) {
  let cursor = tree;
  for (const part of file.split("/")) cursor = cursor[part] ??= {};
}
function render(nodes, prefix = "") {
  const entries = Object.entries(nodes);
  entries.forEach(([name, children], index) => {
    const last = index === entries.length - 1;
    console.log(`${prefix}${last ? "└── " : "├── "}${name}${Object.keys(children).length ? "/" : ""}`);
    render(children, `${prefix}${last ? "    " : "│   "}`);
  });
}
console.log("remesas-latam/");
render(tree);
