"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleverify_1 = require("../helpers/googleverify");
const crud_1 = require("../crud");
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const router = express_1.default.Router();
const isValidStoreDomain = async (url) => {
    const match = url.match(/^https?:\/\/([^/]+)/i);
    if (!match)
        return false;
    const domain = match[1];
    const panel = await (0, crud_1.getDocs)("registered_panels", null, {
        find: { field: "uid", operator: "==", value: domain },
    });
    return !!panel;
};
router.get("/login/google", async (req, res) => {
    const { redirect, panel_id } = req.query;
    if (!redirect || !panel_id) {
        res.status(400).send("Missing redirect or panel_id");
        return;
    }
    const state = encodeURIComponent(JSON.stringify({ redirect, panel_id: Number(panel_id) }));
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${env_1.env.GOOGLE_CLIENT_ID}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile` +
        `&redirect_uri=${encodeURIComponent("https://auth.validpanel.com/api/auth/panel/callback/google")}` +
        `&state=${state}`;
    res.redirect(authUrl);
});
router.get("/callback/google", async (req, res) => {
    const { code, state } = req.query;
    if (!code || !state) {
        res.status(400).send("Missing code or state");
        return;
    }
    let redirectDomain, panel_id;
    try {
        const parsed = JSON.parse(decodeURIComponent(state));
        redirectDomain = parsed.redirect;
        panel_id = parseInt(parsed.panel_id);
    }
    catch {
        res.status(400).send("Invalid state");
        return;
    }
    const allowed = await isValidStoreDomain(redirectDomain);
    if (!allowed) {
        res.status(400).send("Unauthorized domain");
        return;
    }
    try {
        const tokenRes = await axios_1.default.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: env_1.env.GOOGLE_CLIENT_ID,
            client_secret: env_1.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: "https://auth.validpanel.com/api/auth/panel/callback/google",
            grant_type: "authorization_code",
        });
        const { id_token } = tokenRes.data;
        const googleUser = await (0, googleverify_1.verifyGoogleIdToken)(id_token);
        const users = await (0, crud_1.getDocs)("users", panel_id);
        let user = users.find((u) => u.email === googleUser.email);
        if (!user) {
            user = {
                email: googleUser.email,
                username: googleUser.name.replace(/\s/g, "").toLowerCase(),
                image: googleUser.picture,
                password: await bcrypt_1.default.hash(Date.now().toString(), 10),
                api_key: (0, uuid_1.v4)(),
                timestamp: new Date(),
                uid: (0, uuid_1.v4)(),
            };
            await (0, crud_1.addPanelDoc)("users", user, panel_id);
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, panel_id, key: user.api_key }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
        const redirectTo = `${redirectDomain}?token=${token}&email=${encodeURIComponent(user.email)}`;
        res.redirect(redirectTo);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("OAuth failed");
    }
});
exports.default = router;
