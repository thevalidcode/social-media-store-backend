"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_VERSION = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const pkg = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../package.json"), "utf-8"));
exports.API_VERSION = pkg.version;
