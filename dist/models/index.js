"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const panels_1 = __importDefault(require("./panels"));
const providers_1 = __importDefault(require("./providers"));
const categories_1 = __importDefault(require("./categories"));
const user_1 = __importDefault(require("./user"));
const service_1 = __importDefault(require("./service"));
const design_styles_1 = __importDefault(require("./design_styles"));
const currencies_1 = __importDefault(require("./currencies"));
(async () => {
    try {
        await (0, panels_1.default)();
        await (0, providers_1.default)();
        await (0, categories_1.default)();
        await (0, user_1.default)();
        await (0, service_1.default)();
        await (0, design_styles_1.default)();
        await (0, currencies_1.default)();
        console.log("Tables created successfully.");
        process.exit(0);
    }
    catch (err) {
        console.error("Failed to create tables:", err?.message || err);
        process.exit(1);
    }
})();
