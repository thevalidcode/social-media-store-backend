import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./config/db.config";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import { dynamicCors } from "./config/cors.config";

// Routes
import userRouter from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import storeRoutes from "./routes/store.routes";
import blogRoutes from "./routes/blog.routes";
import faqRoutes from "./routes/faq.routes";
import serviceRoutes from "./routes/service.routes";
import providerRoutes from "./routes/provider.routes";
import adminRoutes from "./routes/admin.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import refillRoutes from "./routes/refill.routes";
import versionRouter from "./routes/version.routes";
import filesRouter from "./routes/files.routes";
import paymentGatewayRouter from "./routes/paymentGateway.routes";
import supportRouter from "./routes/support.routes";
import paymentRouter from "./routes/payment.routes";
import webhookRouter from "./routes/webhook.routes";
import statisticsRouter from "./routes/statistics.routes";
import swaggerRouter from "./docs/swagger";

const app = express();

// --- Middleware ---
app.use(bodyParser.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(express.urlencoded({ extended: true }));
app.use(
  "/assets",
  express.static(path.join(__dirname, "..", "public", "assets"))
);

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
app.use("/api/v1/user", cors(dynamicCors), userRouter);
app.use("/api/v1/store", cors(dynamicCors), storeRoutes);
app.use("/api/v1/blog", cors(dynamicCors), blogRoutes);
app.use("/api/v1/faq", cors(dynamicCors), faqRoutes);
app.use("/api/v1/service", cors(dynamicCors), serviceRoutes);
app.use("/api/v1/provider", cors(dynamicCors), providerRoutes);
app.use("/api/v1/category", cors(dynamicCors), categoryRoutes);
app.use("/api/v1/order", cors(dynamicCors), orderRoutes);
app.use("/api/v1/refill", cors(dynamicCors), refillRoutes);
app.use("/api/v1/version", cors(dynamicCors), versionRouter);
app.use("/api/v1/files", cors(dynamicCors), filesRouter);
app.use("/api/v1/webhook", cors(dynamicCors), webhookRouter);
app.use("/api/v1/payment", cors(dynamicCors), paymentRouter);
app.use("/api/v1/support", cors(dynamicCors), supportRouter);
app.use("/api/v1/statistics", cors(dynamicCors), statisticsRouter);
app.use("/api/v1/paymentGateway", cors(dynamicCors), paymentGatewayRouter);

// Internal Routes
app.use("/admin", adminRoutes);
app.use("/api/auth/store", authRoutes);

app.use(swaggerRouter);

export default app;
