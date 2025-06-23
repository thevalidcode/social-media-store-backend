import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import pgSession from "connect-pg-simple";
import { vp_pool } from "./config/db";
import { env } from "./config/env";

// Routes
import userRouter from "./routes/user";
import oauthRoutes from "./routes/oauth";
import panelRoutes from "./routes/panel";
import serviceRoutes from "./routes/service";
import { getDocs } from "./crud";
import swaggerRouter from "./middleware/swagger";

const app = express();

// --- Dynamic CORS ---
let allowedOrigins: string[] = [];

async function updateAllowedOrigins(): Promise<void> {
  const registered_panels = await getDocs("registered_panels", null, {
    filter: { field: "ssl", operator: "===", value: true },
  });

  const domains = registered_panels.map((panel: any) => panel.uid);
  allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:6060",
    ...domains.flatMap((domain: string) => [
      `https://${domain}`,
      `https://${domain}:6060`,
    ]),
  ];
}

updateAllowedOrigins();
setInterval(updateAllowedOrigins, 5 * 60 * 1000);

// --- CORS ---
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// --- Session ---
const pgSess = pgSession(session);

app.use(
  session({
    store: new pgSess({
      pool: vp_pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// --- Public Routes ---
app.use("/user", userRouter);
app.use("/api/auth/panel", oauthRoutes);
app.use("/panel", panelRoutes);
app.use("/service", serviceRoutes);

// --- Swagger ---
app.use(swaggerRouter);

// --- Admin Login Pages ---
app.get("/admin/login", (_req: Request, res: Response) => {
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

app.post("/admin/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    (req.session as any).isAdmin = true;
    res.redirect("/admin/docs");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.post("/admin/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default app;
