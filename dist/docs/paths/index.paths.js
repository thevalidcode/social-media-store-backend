"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = void 0;
// This file centralizes all path registrations
const registry_1 = require("../components/registry");
Object.defineProperty(exports, "registry", { enumerable: true, get: function () { return registry_1.registry; } });
require("./user.paths");
require("./service.paths");
require("./provider.paths");
require("./category.paths");
require("./panel.paths");
require("./auth.paths");
