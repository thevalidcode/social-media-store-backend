"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleIdToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../config/env");
const client = new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID || "");
const verifyGoogleIdToken = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: env_1.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
        throw new Error("Invalid Google ID token");
    }
    return {
        email: payload.email,
        name: payload.name || "",
        avatar: payload.picture || "",
        googleId: payload.sub,
        picture: payload.picture || "",
    };
};
exports.verifyGoogleIdToken = verifyGoogleIdToken;
