"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRates = void 0;
exports.getCurrentRates = getCurrentRates;
const axios_1 = __importDefault(require("axios"));
const crud_1 = require("../crud");
const env_1 = require("../config/env");
const rateKey = env_1.env.RATE_KEY;
async function getCurrentRates() {
    try {
        const response = await axios_1.default.get(`http://apilayer.net/api/live?access_key=${rateKey}`);
        let data = response.data;
        const quotes = {};
        for (const [currencyCode, rate] of Object.entries(data.quotes)) {
            const formattedCurrencyCode = currencyCode.substring(3);
            quotes[formattedCurrencyCode] = rate;
        }
        quotes["USD"] = 1;
        return quotes;
    }
    catch (error) {
        return null;
    }
}
const saveRates = async () => {
    const rates = await getCurrentRates();
    if (rates) {
        try {
            const existingRates = await (0, crud_1.getDocs)("currencies", 1);
            if (existingRates.length !== 0) {
                await (0, crud_1.updatePanelDoc)("currencies", existingRates[0].uid, { quotes: rates, timestamp: new Date() }, 1);
            }
            else {
                await (0, crud_1.addPanelDoc)("currencies", { quotes: rates }, 1);
            }
        }
        catch (error) {
            console.error("Error saving exchange rates:", error.message || error);
        }
    }
};
exports.saveRates = saveRates;
