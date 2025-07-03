"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = getTemplate;
const order_1 = require("./order");
const refill_1 = require("./refill");
const service_1 = require("./service");
const support_1 = require("./support");
const user_1 = require("./user");
// Templates object
const templates = {
    verification_code: user_1.verificationCode,
    new_user: user_1.newUser,
    new_order: order_1.newOrder,
    new_failed_order: order_1.newFailedOrder,
    new_refill: refill_1.newRefill,
    new_failed_refill: refill_1.newFailedRefill,
    new_service: service_1.newService,
    new_support: support_1.newSupport,
    new_message: support_1.newMessage,
    funds_added: user_1.fundsAdded,
};
/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - The identifier for the template (e.g., 'welcome', 'resetPassword')
 * @param variables - A key-value map of variables to be injected into the template
 * @returns A rendered email template string
 * @throws If the template type is not found
 */
function getTemplate(type, variables) {
    const templateFn = templates[type];
    if (!templateFn) {
        throw new Error(`Email template for type "${type}" not found.`);
    }
    return templateFn(variables);
}
