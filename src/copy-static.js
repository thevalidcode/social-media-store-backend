const fs = require("fs");
const path = require("path");

// Project root: go up from src/
const rootDir = path.join(__dirname, "..");

// Actual /dist folder (at project root)
const distDir = path.join(rootDir, "dist");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((item) =>
      copyRecursive(path.join(src, item), path.join(dest, item))
    );
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy public folder: src/public → dist/public
copyRecursive(
  path.join(rootDir, "src", "public"),
  path.join(distDir, "public")
);

// Copy package.json → dist/package.json
fs.copyFileSync(
  path.join(rootDir, "package.json"),
  path.join(distDir, "package.json")
);

console.log("✔️ Static files copied to dist");
