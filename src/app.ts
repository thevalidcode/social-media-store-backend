import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import PrismaSessionStore from "./utils/PrismaSessionStore";
import { dynamicHost, openCors } from "./config/cors.config";

// Routes
import swaggerRouter from "./docs/swagger";
import internalRouter from "./routes/internal.routes";
import publicApiRoutes from "./routes/api.routes";
import userRouter from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import storeRoutes from "./routes/store.routes";
import blogRoutes from "./routes/blog.routes";
import faqRoutes from "./routes/faq.routes";
import pageRoutes from "./routes/page.routes";
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
import transactionRouter from "./routes/transaction.routes";
import ratesRouter from "./routes/rate.routes";

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

app.set("trust proxy", 1);

app.use(
  session({
    store: new PrismaSessionStore(),
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
app.use("/v1/users", cors(dynamicHost), userRouter);
app.use("/v1/stores", cors(dynamicHost), storeRoutes);
app.use("/v1/blogs", cors(dynamicHost), blogRoutes);
app.use("/v1/faqs", cors(dynamicHost), faqRoutes);
app.use("/v1/pages", cors(dynamicHost), pageRoutes);
app.use("/v1/services", cors(dynamicHost), serviceRoutes);
app.use("/v1/providers", cors(dynamicHost), providerRoutes);
app.use("/v1/categories", cors(dynamicHost), categoryRoutes);
app.use("/v1/orders", cors(dynamicHost), orderRoutes);
app.use("/v1/refills", cors(dynamicHost), refillRoutes);
app.use("/v1/version", cors(dynamicHost), versionRouter);
app.use("/v1/files", cors(dynamicHost), filesRouter);
app.use("/v1/payments", cors(dynamicHost), paymentRouter);
app.use("/v1/supports", cors(dynamicHost), supportRouter);
app.use("/v1/statistics", cors(dynamicHost), statisticsRouter);
app.use("/v1/payment-gateways", cors(dynamicHost), paymentGatewayRouter);
app.use("/v1/admins", cors(dynamicHost), adminRoutes);
app.use("/v1/rates", cors(dynamicHost), ratesRouter);
app.use("/v1/transactions", cors(dynamicHost), transactionRouter);

// Webhook Routes (no CORS - these are called by external services)
app.use("/v1/webhooks", openCors, webhookRouter);

// Internal Routes
app.use("/internal", internalRouter);
app.use("/v2", publicApiRoutes);
app.use("/swagger", swaggerRouter);

// Auth Routes (this is for the auth.vaalidpanel.com domain to handle OAuth)
app.use("/api/auth/social-media-store", openCors, authRoutes);

export default app;
