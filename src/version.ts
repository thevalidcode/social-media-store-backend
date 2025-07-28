import { readFileSync } from "fs";
import { join } from "path";

const pkgPath = join(__dirname, "../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

export const API_VERSION = pkg.version as string;
