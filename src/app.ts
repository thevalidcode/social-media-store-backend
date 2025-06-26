import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./config/db";
import { env } from "./config/env";

// Routes
import userRouter from "./routes/user";
import oauthRoutes from "./routes/oauth";
import panelRoutes from "./routes/panel";
import serviceRoutes from "./routes/service";
import providerRoutes from "./routes/provider";
import adminRoutes from "./routes/admin";
import categoryRoutes from "./routes/category";
import { getDocs } from "./crud";
import swaggerRouter from "./middleware/swagger";

const app = express();

// --- Dynamic CORS ---
let allowedOrigins: string[] = [];

async function updateAllowedOrigins(): Promise<void> {
  const panels = await getDocs("panels", null, {
    filter: { field: "ssl", operator: "===", value: true },
  });

  const domains = panels.map((panel: any) => panel.uid);
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
      pool: pool,
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
app.use("/provider", providerRoutes);
app.use("/category", categoryRoutes);
app.use("/admin", adminRoutes);

// --- Swagger ---
app.use(swaggerRouter);

export default app;
