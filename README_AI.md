# Social Media Store Backend AI Documentation

## 1. Project Overview

**Purpose**: Manages Social Media Marketing (SMM) services - sells social media services (followers, likes, comments, views, etc.) through a multi-tenant marketplace.
**Stack**: Node.js, Express, Prisma (PostgreSQL), Zod.
**Type**: Backend Service (Domain: SMM Services Platform).

## 2. Key Differences from Shop Backend

| Aspect            | Shop Backend                 | SMM Backend                          |
| ----------------- | ---------------------------- | ------------------------------------ |
| Core Resource     | **Product** (physical goods) | **Service** (social media actions)   |
| Fulfillment       | Shop inventory system        | External providers (SMM suppliers)   |
| Key Table         | `products`                   | `services`, `providers`, `refills`   |
| Tenant Identifier | `shopId`                     | `storeId`                            |
| Special Features  | Variants, cart, categories   | Refills, drip-feed, affiliate system |
| Pricing Model     | Fixed + discounts            | Dynamic (per provider)               |

## 3. Core Models & Concepts

### Store (Tenant)

```prisma
model Store {
  storeId     Int
  uid         String        // Domain identifier (not UUID)
  name        String
  description String?
  status      StoreStatus   // ACTIVE, DISABLED, EXPIRED
  ssl         Boolean
  timestamp   DateTime
}
```

- Multi-tenant root entity (like shopId in shop-backend).
- All data scoped by `storeId`.

### Service (What Customers Buy)

```prisma
model Service {
  id              Int
  storeScopedId   Int           // Counter within store
  uid             String        // Globally unique
  name            String        // e.g., "Instagram Followers"
  storeId         Int           // Tenant scoping
  price           Decimal       // Customer price
  min             Int           // Min quantity
  max             Int           // Max quantity
  category        String        // e.g., "Instagram", "TikTok"
  type            ServiceType   // DEFAULT, PACKAGE, CUSTOM
  providerUid     String?       // Link to supplier
  dripFeed        Boolean?      // Gradual delivery
  refill          Boolean?      // Auto-refill capability
  refillDays      Int?          // Refill interval
  network         String?       // Social platform
  sync*           Boolean       // Sync with provider
}
```

### Provider (Service Supplier)

External SMM service provider (Airtm, SMM panels, etc.) who fulfills orders.

```prisma
model Provider {
  id              Int
  uid             String
  name            String
  storeId         Int
  services        Service[]     // Services this provider offers
}
```

### Order (Customer Purchase)

```prisma
model Order {
  storeScopedId   Int
  uid             String
  storeId         Int           // Tenant
  userUid         String        // Customer
  serviceUid      String        // Service purchased
  url             String        // Target URL (Instagram profile, etc.)
  quantity        Int           // Quantity ordered
  price           Decimal       // Amount charged
  status          OrderStatus   // PENDING, PROCESSING, DELIVERED, REFUNDED
  dripFeed        Boolean?      // Is drip-feed enabled?
  interval        Int?          // Drip-feed interval
  starts          Int           // Current count
  remains         Int           // Remaining to deliver
  timestamp       DateTime
}
```

### Refill (Auto-Replenishment)

Auto-replenish orders that dropped below threshold.

```prisma
model Refill {
  id              Int
  uid             String
  storeId         Int
  orderUid        String        // Original order
  quantity        Int
  timestamp       DateTime
}
```

## 4. Architecture Pattern (Identical to Shop Backend)

### Route → Controller → Prisma Flow

**Route** (`src/routes/service.routes.ts`):

```typescript
router.get("/", services.getServices);
router.get("/:serviceId", services.getServiceByID);
router.post("/", authenticateAdmin, checkServiceLimit, services.addService);
```

**Controller** (`src/controllers/service.controllers.ts`):

```typescript
export const getServices = async (req, res) => {
  const { storeId } = safeParse(req.query);
  const services = await prisma.service.findMany({
    where: { storeId, status: "ACTIVE" },
    orderBy: { position: "asc" },
  });
  res.json(services);
};
```

**Schema** (`src/schemas/service.schema.ts`):

```typescript
export const ServiceCreateInputSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.string(),
  min: z.number(),
  max: z.number(),
  providerUid: z.string().optional(),
  dripFeed: z.boolean().optional(),
  refill: z.boolean().optional(),
});
```

## 5. Tenant Isolation Pattern

**Critical Rule**: Every query must be scoped by `storeId`.

```typescript
// ✅ CORRECT
const services = await prisma.service.findMany({
  where: { storeId, status: "ACTIVE" },
});

// ❌ WRONG
const services = await prisma.service.findMany({
  where: { status: "ACTIVE" },
});
```

## 6. Authentication & Authorization

- **Admin**: Store owner. Manages services, orders, settings.
  - Auth via `authenticateAdmin` middleware.
  - `req.auth` contains `{ storeId, uid, ... }`.

- **User**: Customer. Places orders, tracks purchases.
  - Auth via `authenticateUser` middleware.
  - `req.auth` contains `{ storeId, user: { uid, ... }, ... }`.

## 7. Key Features

### Refill System

- Customers can enable auto-refill on orders.
- When order count drops (e.g., unfollows), system auto-replenishes.
- New `Refill` record created + new `Order` placed.

### Drip-Feed

- Gradual delivery over time (e.g., 1000 followers over 30 days).
- Stored in `Order.dripFeed` and `Order.interval`.

### Affiliate System

- `User.refCode`: Referral code.
- `User.ref`: Parent referral user.
- `ReferralOrder`: Tracks referral earnings.

### Provider Integration

- Orders linked to `Provider` via service.
- `sendOrderToProvider()` sends order to external API.
- Provider updates order status via webhook.

## Email Template System

### Structure

- `src/emails/index.ts`: centralized dispatch and logging.
- `src/emails/templates/index.ts`: typed template registry.
- `src/emails/templates/*.templates.ts`: fallback template implementations.
- `src/emails/components/EmailLayout.ts`: layout/theming utilities.
- `email_templates` table (store-scoped): optional custom subject/body per template type.

### How to Add a New Template

1. Add vars interface + template renderer in `src/emails/templates/*.templates.ts`.
2. Register template key in `src/emails/templates/index.ts`.
3. Call `sendUserEmail` / `sendEmailToAdmins` from the business event path with `storeId`.
4. Optionally define a DB override template with the same `type` string.

### Production-Only Sending Rule

- Trigger transactional/business emails in production environment only.
- For new features, add `env.NODE_ENV === "production"` guard at the call site (controller/service) before sending.
- Avoid direct `transporter.sendMail` usage in feature code; route through `src/emails/index.ts`.

## Payment Webhook Modularization

### Pattern

- Keep provider files in `src/providers/*.providers.ts` focused on verification and payload parsing.
- Centralize wallet credit success/failure side effects in `src/services/payments/provider-webhook-handler.ts`.
- Delegate both Paystack and Flutterwave outcomes to the same shared handler contract.

### Benefits

- One place to maintain payment status transitions and transaction creation.
- Consistent wallet credit behavior across gateways.
- Faster future gateway integrations with less duplicated code.

### Adding A New Gateway

1. Add provider-specific init + signature verification code in `src/providers`.
2. Normalize webhook payload into the shared success/failure input shape.
3. Delegate to `handleSmmPaymentSuccess` / `handleSmmPaymentFailure`.
4. Keep any email or notification dispatch inside shared business handlers.

## 8. Feature Development Lifecycle

## Dynamic CORS And Internal Reseller Calls

- Public SMM routes use `dynamicOrigin` in `src/config/cors.config.ts` and validate requests against registered store domains (`store.uid`) plus localhost development hosts.
- Reseller discovery and preview calls coming from core services should provide a `Host` header:
  - Global list requests should use `Host: localhost:3000`.
  - Source-store scoped requests should use `Host: <store.uid>`.
- Internal service routes mounted under `/internal` use `openCors` and JWT auth middleware instead of domain filtering.

### Complete Implementation Checklist

Creating a new feature in social-media-store-backend follows the same structure as shop-backend, but uses SMM domain entities (`storeId`, `service`, `provider`, `refill`).

#### Step 1: Database Schema

Update `prisma/schema.prisma` with new models/fields.

```typescript
model ServiceTier {
  id            Int      @id @default(autoincrement())
  storeId       Int      @map("store_id")
  serviceUid    String   @map("service_uid")
  tier          String   // BASIC, PREMIUM, ENTERPRISE
  multiplier    Decimal  @db.Decimal(10, 2)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([storeId, serviceUid, tier])
  @@map("service_tiers")
}
```

Run after schema changes:

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### Step 2: Zod Validation Schema

Create/update schema in `src/schemas/serviceTier.schema.ts`.

```typescript
import { z } from "zod";

export const CreateServiceTierSchema = z.object({
  serviceUid: z.string().uuid(),
  tier: z.enum(["BASIC", "PREMIUM", "ENTERPRISE"]),
  multiplier: z.coerce.number().positive(),
});

export const GetServiceTierQuerySchema = z.object({
  serviceUid: z.string().uuid().optional(),
  tier: z.enum(["BASIC", "PREMIUM", "ENTERPRISE"]).optional(),
});

export type CreateServiceTierInput = z.infer<typeof CreateServiceTierSchema>;
```

#### Step 3: Rate Limiting

Create domain limiters in `src/middleware/ratelimit/serviceTier.ratelimit.ts`.

```typescript
import { rateLimit } from "express-rate-limit";
import { devBypass } from "./utils";

export const limitServiceTierCreate = devBypass(
  rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 10,
    message: "Too many service tier creation attempts",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const limitServiceTierUpdate = devBypass(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: "Too many service tier updates",
  }),
);
```

Export from `src/middleware/ratelimit/index.ts`:

```typescript
export * from "./serviceTier.ratelimit";
```

#### Step 4: Controller

Implement controller logic in `src/controllers/serviceTier.controllers.ts`.

```typescript
import { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { CreateServiceTierSchema } from "../schemas/serviceTier.schema";

export async function createServiceTier(req: Request, res: Response) {
  try {
    const parsed = CreateServiceTierSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { storeId } = req.auth;

    // Ensure service belongs to this tenant
    const service = await prisma.service.findFirst({
      where: { uid: parsed.data.serviceUid, storeId },
      select: { uid: true },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const tier = await prisma.serviceTier.create({
      data: {
        storeId,
        serviceUid: parsed.data.serviceUid,
        tier: parsed.data.tier,
        multiplier: parsed.data.multiplier,
      },
    });

    return res.status(201).json(tier);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

#### Step 5: Swagger/OpenAPI Documentation

Register paths in `src/docs/paths/serviceTier.paths.ts`.
Follow the established pattern: **import response objects from `src/docs/responses/*`**, do not inline response schemas in path files.

```typescript
import { registry } from "../components/registry";
import {
  CreateServiceTierSchema,
  GetServiceTierQuerySchema,
} from "../../schemas/serviceTier.schema";
import {
  CreateServiceTierResponse,
  ServiceTierListResponse,
} from "../responses/serviceTier.response";
import {
  BadRequest,
  Forbidden,
  Conflict,
  ServerError,
} from "../responses/common.response";

registry.registerPath({
  method: "post",
  path: "/services/tiers",
  summary: "Create service tier",
  tags: ["Service Tier"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateServiceTierSchema,
        },
      },
    },
  },
  responses: {
    201: CreateServiceTierResponse,
    400: BadRequest,
    403: Forbidden,
    409: Conflict,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/services/tiers",
  summary: "Get service tiers",
  tags: ["Service Tier"],
  security: [{ CookieAuth: [] }],
  request: {
    query: GetServiceTierQuerySchema,
  },
  responses: {
    200: ServiceTierListResponse,
    400: BadRequest,
    500: ServerError,
  },
});
```

Then import path file in `src/docs/swagger.ts`:

```typescript
import "./paths/serviceTier.paths";
```

#### Step 6: Middleware Chain in Route Definition

Define routes in `src/routes/service.routes.ts`.

```typescript
import { Router } from "express";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitServiceTierCreate,
  limitServiceTierUpdate,
} from "../middleware/ratelimit";
import { requireActiveSubscription } from "../middleware/subscription-check";
import * as serviceTierControllers from "../controllers/serviceTier.controllers";

const router = Router();

router.post(
  "/tiers",
  authenticateAdmin,
  requireActiveSubscription,
  limitServiceTierCreate,
  serviceTierControllers.createServiceTier,
);

router.patch(
  "/tiers/:uid",
  authenticateAdmin,
  requireActiveSubscription,
  limitServiceTierUpdate,
  serviceTierControllers.updateServiceTier,
);

router.get("/tiers", authenticateAdmin, serviceTierControllers.getServiceTiers);

export default router;
```

In `src/app.ts`:

```typescript
import serviceRoutes from "./routes/service.routes";

app.use("/api/admin/services", serviceRoutes);
```

#### Step 7: Testing

Add tests in `src/tests/serviceTier.test.ts`.

```typescript
describe("Service Tier", () => {
  it("creates tier for service owned by current store", async () => {
    const response = await request(app)
      .post("/api/admin/services/tiers")
      .set("Cookie", `token=${adminToken}`)
      .send({
        serviceUid: existingServiceUid,
        tier: "PREMIUM",
        multiplier: 1.2,
      });

    expect(response.status).toBe(201);
  });

  it("rejects tier creation for another store service", async () => {
    const response = await request(app)
      .post("/api/admin/services/tiers")
      .set("Cookie", `token=${adminToken}`)
      .send({
        serviceUid: otherStoreServiceUid,
        tier: "PREMIUM",
        multiplier: 1.2,
      });

    expect(response.status).toBe(404);
  });
});
```

### Summary Checklist

- [ ] **Step 1**: Update `prisma/schema.prisma` and run generate/migrate
- [ ] **Step 2**: Create Zod schema in `src/schemas/`
- [ ] **Step 3**: Create rate limiter in `src/middleware/ratelimit/` and export from `index.ts`
- [ ] **Step 4**: Implement controller with validation, tenant scoping, and error handling
- [ ] **Step 5**: Register Swagger paths in `src/docs/paths/` and keep responses in `src/docs/responses/`
- [ ] **Step 6**: Define route middleware chain (auth → subscription → rate limit → controller)
- [ ] **Step 7**: Add tests for tenant boundaries and feature behavior

This lifecycle ensures SMM features are validated, rate-limited, tenant-safe, and documented consistently.

## 9. Critical Constraints

- **Isolation**: Never query without `storeId`.
- **Pricing Precision**: Use `Decimal` for monetary values (no floats).
- **Provider Sync**: Orders must be sent to provider after creation.
- **Rate Limiting**: Applied per endpoint. Check `src/middleware/ratelimit/`.
- **Subscription**: Some features require active subscription (checked via middleware).
