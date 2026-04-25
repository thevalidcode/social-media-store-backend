# Copilot Instructions - Social Media Store Backend

You are working in `social-media-store-backend`, a Node.js/Express backend for a multi-tenant SMM service platform.

## 🛠 Tech Stack & Core Libraries
- **Runtime**: Node.js (Latest LTS)
- **Framework**: Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod (strict schemas required)
- **Documentation**: Swagger/OpenAPI
- **External APIs**: Provider integration (order fulfillment)

## 🏗 Architecture & File Structure

### Key Directories
- `src/controllers/`: Request handlers (validation → DB query → response).
- `src/services/`: Complex business logic (subscription checks, provider sync).
- `src/routes/`: Route definitions with middleware.
- `src/schemas/`: Zod schemas for validation + OpenAPI.
- `src/middleware/`: Auth, rate limits, feature gates, subscription checks.
- `prisma/schema.prisma`: Data model (single source of truth).

### API Patterns

1.  **Response Format**:
    JSON responses for all endpoints.
    ```json
    // Success
    { "data": { ... } }
    // Error
    { "error": { ... } }
    ```

2.  **Authentication**:
    - `authenticateUser` → `req.auth` contains `{ storeId, user: { uid, ... } }`
    - `authenticateAdmin` → `req.auth` contains `{ storeId, uid, ... }`
    - **CRITICAL**: Always use `req.auth.storeId` to scope database queries.

## 🚨 Critical Engineering Rules

### 1. Tenant Isolation (Security)
- **NEVER** query `Service`, `Order`, `Refill`, `User` tables without `where: { storeId: ... }`.
- **Data leakage between stores is a P0 incident**.
- Exception: Auth logic (requires strict code review).

**Example**:
```typescript
// ✅ CORRECT
const orders = await prisma.order.findMany({
  where: { storeId, userUid: user.uid },
});

// ❌ WRONG
const orders = await prisma.order.findMany({
  where: { userUid: user.uid },
});
```

### 2. Feature Implementation Checklist
When adding a new SMM feature (e.g., "Bulk Order Management"):
1.  [ ] **Model**: Add model to `prisma/schema.prisma`. Run `npm run prisma:generate`.
2.  [ ] **Schema**: Create `src/schemas/feature.schema.ts` with Zod.
3.  [ ] **Controller**: Create `src/controllers/feature.controllers.ts`.
    - Validate input: `const { data, error } = FeatureSchema.safeParse(req.body)`
    - Scope queries by `storeId`
    - Handle async operations (provider sync)
4.  [ ] **Service** (if complex): Create `src/services/feature.services.ts`.
5.  [ ] **Route**: Create `src/routes/feature.routes.ts`.
    - Apply `authenticateAdmin` or `authenticateUser`.
    - Apply rate limit middleware.
    - Apply subscription check if needed.
6.  [ ] **Register**: Add route to `src/app.ts`.

### 3. Code Style & Standards
- **Imports**: Use ES6 modules.
- **Naming**:
    - Files: `camelCase` (e.g., `order.controllers.ts`).
    - Functions: `camelCase` (e.g., `getOrders`, `createOrder`).
    - Routes: `/v1/resources`.
- **Async/Await**: Always use async/await. Never `.then()`.
- **Type Safety**: Strictly typed `req` and `res`. No `any`.
- **Decimal Precision**: Use `Decimal` from Prisma for prices (not floats).

## 🔍 Domain-Specific Patterns

### Services (Not Products)
- **Service**: A sellable SMM action (e.g., Instagram Followers).
- **Provider**: External supplier fulfilling the service.
- **Order**: Customer purchase of a service.
- **Refill**: Auto-replenishment when order count drops.

### Drip-Feed & Refill
- **Drip-Feed**: Gradual delivery over time.
  ```typescript
  const order = await prisma.order.create({
    data: {
      dripFeed: true,
      interval: 3600, // seconds between deliveries
      quantity: 1000,
    },
  });
  ```

- **Refill**: Auto-reorder when quantity drops.
  ```typescript
  const shouldRefill = order.remains < threshold;
  if (shouldRefill) {
    // Create new Refill record
    // Send order to provider
  }
  ```

### Provider Sync
- Orders must be synced to external provider immediately after creation.
- Use `sendOrderToProvider()` from `src/providers/order.providers`.
- Handle provider API rate limits + error retries.

## 🚫 Anti-Patterns
- **Do NOT** put inline Zod schemas in controllers. Define in `src/schemas/`.
- **Do NOT** use `req.body` without validation.
- **Do NOT** forget tenant scoping (storeId) in queries.
- **Do NOT** use floating-point arithmetic for prices (use Decimal).
- **Do NOT** bypass provider sync for orders.

## Environment Variables
Refer to `.env.example` or `src/config/env.config.ts`. Key variables: `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `INTERNAL_SERVICE_USER_JWT_SECRET`.

## Deployment
- Dockerized via standard Node setup.
- Run migrations before deploy: `npm run migrate`.
- Run with: `npm start`.
