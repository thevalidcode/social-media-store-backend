"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const version_1 = require("../version");
const router = express_1.default.Router();
router.get("/version", (_, res) => {
    res.json({ version: version_1.API_VERSION });
});
exports.default = router;
