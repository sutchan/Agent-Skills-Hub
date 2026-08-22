const fs = require("fs");
const path = require("path");
const root = "e:/Github/Agent-Skills-Hub";
function mv(src, dst) {
  const s = path.join(root, src), d = path.join(root, dst);
  if (!fs.existsSync(s)) return;
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.renameSync(s, d);
  console.log(src, "->", dst);
}
const appApp = path.join(root, "app/app");
if (fs.existsSync(appApp)) {
  for (const e of fs.readdirSync(appApp, { withFileTypes: true })) {
    mv("app/app/" + e.name, "app/" + e.name);
  }
  fs.rmdirSync(appApp);
}
const appPub = path.join(root, "app/public");
if (fs.existsSync(appPub)) {
  for (const e of fs.readdirSync(appPub, { withFileTypes: true })) {
    mv("app/public/" + e.name, "public/" + e.name);
  }
  fs.rmdirSync(appPub);
}
console.log("DONE");
