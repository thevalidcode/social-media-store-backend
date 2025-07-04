import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./config/db";
import { env } from "./config/env";
import cors, { CorsOptions, CorsRequest } from "cors";

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
import path from "path";
import cookieParser from "cookie-parser";

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


const dynamicCors = function (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) {
  const origin = req.headers.origin;

  // Cast to `any` just for accessing `.url`
  const url = (req as any).url || "";

  const swaggerSafePaths = ["/admin/docs", "/admin/login"];
  const isSwagger = swaggerSafePaths.some((path) => url.startsWith(path));

  if (env.NODE_ENV === "development") {
    return callback(null, { origin: true, credentials: true });
  }

  if (!origin && isSwagger) {
    return callback(null, { origin: true, credentials: true });
  }

  if (origin && allowedOrigins.includes(origin)) {
    return callback(null, { origin: true, credentials: true });
  }

  return callback(new Error("Not allowed by CORS"), { origin: false });
};

app.use(cors(dynamicCors));

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
app.use("/user", userRouter);
app.use("/api/auth/panel", oauthRoutes);
app.use("/panel", panelRoutes);
app.use("/service", serviceRoutes);
app.use("/provider", providerRoutes);
app.use("/category", categoryRoutes);
app.use("/order", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/", versionRouter);

// --- Swagger ---
app.use(swaggerRouter);

export default app;
