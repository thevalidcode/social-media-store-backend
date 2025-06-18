import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import pgSession from "connect-pg-simple";
import { vp_pool } from "./db.js";

// Routes
import userRouter from "./routes/user.js";
import oauthRoutes from "./routes/oauth.js";
import panelRoutes from "./routes/panel.js";
import { getDocs } from "./crud.js";

const app = express();

let allowedOrigins = [];

async function updateAllowedOrigins() {
  const registered_panels = await getDocs("registered_panels", null, {
    filter: { field: "ssl", operator: "===", value: true },
  });

  const domains = registered_panels.map((panel) => panel.uid);
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

// Refresh every 5 minutes
setInterval(updateAllowedOrigins, 5 * 60 * 1000);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const pgSess = pgSession(session);
app.use(
  session({
    store: new pgSess({
      pool: vp_pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Public routes
app.use("/user", userRouter);
app.use("/auth", oauthRoutes);
app.use("/panel", panelRoutes);

const swaggerDocument = YAML.load("./docs/swagger-bundled.yaml");

// Middleware to protect swagger docs for admin only
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).send("Unauthorized. Admin login required.");
}

app.use(
  "/admin/docs",
  isAdmin,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ----------- Admin Login Routes -------------

app.get("/admin/login", (req, res) => {
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
</html>

  `);
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  // Replace below with your actual admin credential check (secure it properly)
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    res.redirect("/admin/docs");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default app;
