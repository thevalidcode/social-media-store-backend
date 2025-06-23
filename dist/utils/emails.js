"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendUserEmail = sendUserEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const crud_1 = require("../crud");
const emailTemplates_1 = require("./emailTemplates");
const transporter = nodemailer_1.default.createTransport({
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail",
});
function interpolateHtml(html, variables) {
    return html.replace(/\{\{(.*?)\}\}/g, (_, variableName) => {
        return variables[variableName.trim()] || "";
    });
}
async function getEmailTemplate(type, data, logo_url, panel_id) {
    const template = await (0, crud_1.getDocs)("email_templates", panel_id, {
        find: { type },
    });
    const variables = {
        logo: logo_url,
        ...data,
    };
    if (!template) {
        await (0, crud_1.updatePanelDoc)("email_templates", template.uid, { type }, panel_id);
    }
    const interpolatedHtml = interpolateHtml(template?.content || "", variables);
    const defaultTemplate = (0, emailTemplates_1.getTemplate)(type, variables); // fallback
    const htmlTemplate = interpolatedHtml || defaultTemplate;
    return {
        subject: `${type
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim()} Notification`,
        html: htmlTemplate,
    };
}
async function sendEmailConfig(from, to, type, data, logo_url, panel_id) {
    const emailTemplate = await getEmailTemplate(type, data, logo_url, panel_id);
    try {
        const mailOptions = {
            from,
            to,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        };
        const info = await transporter.sendMail(mailOptions);
        await (0, crud_1.addPanelDoc)("notifications", {
            from,
            to,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            timestamp: new Date(),
            status: "success",
            messageId: info.messageId,
            response: info.response,
        }, panel_id);
        return { success: true };
    }
    catch (error) {
        await (0, crud_1.addPanelDoc)("notifications", {
            from,
            to,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            timestamp: new Date(),
            status: "error",
            response: error.message,
        }, panel_id);
        return { success: false };
    }
}
async function sendEmail(from = '"Valid Panel" <contact@validpanel.com>', type, data, panel_id) {
    try {
        if (type === "new_order" && data.price <= 0)
            return;
        const adminEmails = await (0, crud_1.getDocs)("admin_emails", panel_id);
        const general = await (0, crud_1.getDocs)("general", panel_id, {
            find: { field: "uid", operator: "===", value: "site" },
        });
        for (const doc of adminEmails) {
            await sendEmailConfig(from, doc.email, type, data, general.logo_url, panel_id);
        }
    }
    catch (error) {
        console.error({ error: error.message });
    }
}
async function sendUserEmail(from = '"Panel" <contact@validpanel.com>', to, type, data, panel_id) {
    try {
        const general = await (0, crud_1.getDocs)("general", panel_id, {
            find: { field: "uid", operator: "===", value: "site" },
        });
        await sendEmailConfig(from, to, type, data, general.logo_url, panel_id);
    }
    catch (error) {
        console.error({ error: error.message });
    }
}
