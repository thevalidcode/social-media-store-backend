"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
const service_1 = __importDefault(require("./service"));
const styles_1 = __importDefault(require("./styles"));
(async () => {
    try {
        await (0, user_1.default)();
        await (0, service_1.default)();
        await (0, styles_1.default)();
        console.log("Tables created successfully.");
        process.exit(0);
    }
    catch (err) {
        console.error("Failed to create tables:", err?.message || err);
        process.exit(1);
    }
})();
