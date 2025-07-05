import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions, CorsRequest } from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./config/db";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import path from "path";

// Routes
import userRouter from "./routes/user";
import oauthRoutes from "./routes/oauth";
import panelRoutes from "./routes/panel";
import serviceRoutes from "./routes/service";
import providerRoutes from "./routes/provider";
import adminRoutes from "./routes/admin";
import categoryRoutes from "./routes/category";
import orderRoutes from "./routes/order";
import versionRouter from "./routes/version";
import { getDocs } from "./crud";
import swaggerRouter from "./docs/swagger";

const app = express();

// --- Dynamic CORS Setup ---
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

// Define CORS Middleware for all non-/admin routes
const dynamicCors = function (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) {
  const origin = req.headers.origin;

  if (env.NODE_ENV === "development") {
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
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

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
app.use("/user", cors(dynamicCors), userRouter);
app.use("/api/auth/panel", cors(dynamicCors), oauthRoutes);
app.use("/panel", cors(dynamicCors), panelRoutes);
app.use("/service", cors(dynamicCors), serviceRoutes);
app.use("/provider", cors(dynamicCors), providerRoutes);
app.use("/category", cors(dynamicCors), categoryRoutes);
app.use("/order", cors(dynamicCors), orderRoutes);
app.use("/admin", adminRoutes);

// --- Version Info ---
app.use("/version", cors(dynamicCors), versionRouter);

app.use(swaggerRouter);

export default app;
