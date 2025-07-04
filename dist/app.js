"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
// Routes
const user_1 = __importDefault(require("./routes/user"));
const oauth_1 = __importDefault(require("./routes/oauth"));
const panel_1 = __importDefault(require("./routes/panel"));
const service_1 = __importDefault(require("./routes/service"));
const provider_1 = __importDefault(require("./routes/provider"));
const admin_1 = __importDefault(require("./routes/admin"));
const category_1 = __importDefault(require("./routes/category"));
const order_1 = __importDefault(require("./routes/order"));
const version_1 = __importDefault(require("./routes/version"));
const crud_1 = require("./crud");
const swagger_1 = __importDefault(require("./docs/swagger"));
const app = (0, express_1.default)();
// --- Dynamic CORS Setup ---
let allowedOrigins = [];
async function updateAllowedOrigins() {
    const panels = await (0, crud_1.getDocs)("panels", null, {
        filter: { field: "ssl", operator: "===", value: true },
    });
    const domains = panels.map((panel) => panel.uid);
    allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:6060",
        ...domains.flatMap((domain) => [
            `https://${domain}`,
            `https://${domain}:6060`,
        ]),
    ];
}
updateAllowedOrigins();
setInterval(updateAllowedOrigins, 5 * 60 * 1000);
// Define CORS Middleware for all non-/admin routes
const dynamicCors = function (req, callback) {
    const origin = req.headers.origin;
    if (env_1.env.NODE_ENV === "development") {
        return callback(null, { origin: true, credentials: true });
    }
    if (!origin) {
        return callback(new Error("Origin header is required by CORS"), {
            origin: false,
        });
    }
    if (allowedOrigins.includes(origin)) {
        return callback(null, { origin: true, credentials: true });
    }
    return callback(new Error("Not allowed by CORS"), { origin: false });
};
// --- Middleware ---
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "public", "assets")));
// --- Session ---
const pgSess = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use((0, express_session_1.default)({
    store: new pgSess({
        pool: db_1.pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
    }),
    secret: env_1.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env_1.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));
// --- Public Routes ---
app.use("/user", (0, cors_1.default)(dynamicCors), user_1.default);
app.use("/api/auth/panel", (0, cors_1.default)(dynamicCors), oauth_1.default);
app.use("/panel", (0, cors_1.default)(dynamicCors), panel_1.default);
app.use("/service", (0, cors_1.default)(dynamicCors), service_1.default);
app.use("/provider", (0, cors_1.default)(dynamicCors), provider_1.default);
app.use("/category", (0, cors_1.default)(dynamicCors), category_1.default);
app.use("/order", (0, cors_1.default)(dynamicCors), order_1.default);
app.use("/admin", admin_1.default);
// --- Version Info ---
app.use("/", (0, cors_1.default)(dynamicCors), version_1.default);
app.use(swagger_1.default);
exports.default = app;
