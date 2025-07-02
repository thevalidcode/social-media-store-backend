import { readFileSync, existsSync } from "fs";
import { join } from "path";

const distPath = join(__dirname, "./package.json");
const srcPath = join(__dirname, "../package.json");

const pkgPath = existsSync(distPath) ? distPath : srcPath;

const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

export const API_VERSION = pkg.version as string;
