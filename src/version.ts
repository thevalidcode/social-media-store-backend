import { readFileSync } from "fs";
import { join } from "path";

const pkg = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

export const API_VERSION = pkg.version as string;
