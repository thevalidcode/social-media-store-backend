import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.config";
import cookieParser from "cookie-parser";
import path from "path";
import { apiLimiter } from "./middleware/ratelimit";
import PrismaSessionStore from "./utils/PrismaSessionStore";
import { dynamicCors } from "./config/cors.config";

// Routes
import swaggerRouter from "./docs/swagger";
import internalRouter from "./routes/internal.routes";
import publicApiRoutes from "./routes/api.routes";
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
app.use("/api/v1/users", cors(dynamicCors), userRouter);
app.use("/api/v1/stores", cors(dynamicCors), storeRoutes);
app.use("/api/v1/blogs", cors(dynamicCors), blogRoutes);
app.use("/api/v1/faqs", cors(dynamicCors), faqRoutes);
app.use("/api/v1/services", cors(dynamicCors), serviceRoutes);
app.use("/api/v1/providers", cors(dynamicCors), providerRoutes);
app.use("/api/v1/categories", cors(dynamicCors), categoryRoutes);
app.use("/api/v1/orders", cors(dynamicCors), orderRoutes);
app.use("/api/v1/refills", cors(dynamicCors), refillRoutes);
app.use("/api/v1/version", cors(dynamicCors), versionRouter);
app.use("/api/v1/files", cors(dynamicCors), filesRouter);
app.use("/api/v1/webhooks", cors(dynamicCors), webhookRouter);
app.use("/api/v1/payments", cors(dynamicCors), paymentRouter);
app.use("/api/v1/supports", cors(dynamicCors), supportRouter);
app.use("/api/v1/statistics", cors(dynamicCors), statisticsRouter);
app.use("/api/v1/payment-gateways", cors(dynamicCors), paymentGatewayRouter);
app.use("/api/v1/admins", cors(dynamicCors), adminRoutes);
app.use("/api/v1/rates", cors(dynamicCors), ratesRouter);

// Internal Routes
app.use("/internal", internalRouter);
app.use("/api/v2", publicApiRoutes);
app.use("/api/auth/store", authRoutes);
app.use("/swagger", swaggerRouter);

export default app;
