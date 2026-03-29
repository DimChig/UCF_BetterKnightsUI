const fs = require("fs");
const path = require("path");

const BROWSERS = ["chrome", "safari", "firefox"];
const SRC_DIR = path.join(__dirname, "src");
const BUILD_DIR = path.join(__dirname, "build");
const MANIFESTS_DIR = path.join(__dirname, "manifests");

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean and rebuild
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true });
}

for (const browser of BROWSERS) {
  const outDir = path.join(BUILD_DIR, browser);

  // Copy all source files
  copyDirSync(SRC_DIR, outDir);

  // Copy browser-specific manifest
  fs.copyFileSync(
    path.join(MANIFESTS_DIR, `${browser}.json`),
    path.join(outDir, "manifest.json")
  );

  // Firefox uses background.scripts in manifest, so remove importScripts
  if (browser === "firefox") {
    const bgPath = path.join(outDir, "scripts", "background.js");
    let bg = fs.readFileSync(bgPath, "utf8");
    bg = bg.replace(/importScripts\("browser-polyfill\.min\.js"\);\r?\n\r?\n/, "");
    fs.writeFileSync(bgPath, bg);
  }

  console.log(`Built: build/${browser}/`);
}

console.log("Done.");
