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
// Routes
const user_1 = __importDefault(require("./routes/user"));
const oauth_1 = __importDefault(require("./routes/oauth"));
const panel_1 = __importDefault(require("./routes/panel"));
const service_1 = __importDefault(require("./routes/service"));
const crud_1 = require("./crud");
const swagger_1 = __importDefault(require("./middleware/swagger"));
const app = (0, express_1.default)();
// --- Dynamic CORS ---
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
// --- CORS ---
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
}));
// --- Middleware ---
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use("/user", user_1.default);
app.use("/api/auth/panel", oauth_1.default);
app.use("/panel", panel_1.default);
app.use("/service", service_1.default);
// --- Swagger ---
app.use(swagger_1.default);
// --- Admin Login Pages ---
app.get("/admin/login", (_req, res) => {
    res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Login</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .login-form {
      background: #fff;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 400px;
    }

    .login-form h2 {
      margin-bottom: 1.5rem;
      color: #333;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.2rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus {
      border-color: #6a0dad;
      outline: none;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: #6a0dad;
      color: white;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    button:hover {
      background: #5800a8;
    }

    @media (max-width: 480px) {
      .login-form {
        padding: 1.5rem;
      }

      h2 {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>

  <form class="login-form" method="POST" action="/admin/login">
    <h2>Admin Login</h2>

    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" name="username" id="username" required />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" name="password" id="password" required />
    </div>

    <button type="submit">Login</button>
  </form>

</body>
</html>`);
});
app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === env_1.env.ADMIN_USERNAME && password === env_1.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect("/admin/docs");
    }
    else {
        res.status(401).send("Invalid credentials");
    }
});
app.post("/admin/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
});
exports.default = app;
