# Social Media Store Backend Architecture

## Overview
The `social-media-store-backend` is the API engine for multi-tenant SMM (Social Media Marketing) service marketplaces. Each tenant (store) sells social media services through external providers.

## Core Concepts

### Three Layers of Multi-Tenancy
1. **Store**: The top-level tenant identifier (like shopId).
2. **Service**: A sellable SMM action belonging to a store.
3. **Provider**: External SMM service fulfiller (supplier).

### Business Flow

```
Admin Creates Service
  ↓
Links to Provider (Airtm, SMM Panel, etc.)
  ↓
Customer Places Order
  ↓
Order sent to Provider API
  ↓
Provider executes (delivers followers, likes, etc.)
  ↓
Provider updates order status via webhook
  ↓
Order marked COMPLETED
```

## Key Tables & Relationships

| Table | Purpose | Scoping |
|---|---|---|
| `stores` | Tenant root | Primary key `storeId` |
| `services` | Sellable items | `storeId` |
| `providers` | SMM suppliers | `storeId` |
| `orders` | Customer purchases | `storeId` |
| `refills` | Auto-replenishment | `storeId` |
| `users` | Customers | `storeId` |
| `transactions` | Payment records | `storeId` |

## API Routes

| Endpoint | Purpose |
|---|---|
| `GET /v1/services` | List active services (public) |
| `POST /v1/services` | Create service (admin only) |
| `GET /v1/orders` | List user orders |
| `POST /v1/orders` | Place order (customers) |
| `GET /v1/providers` | List available providers |
| `GET /v1/refills` | List auto-refills (user) |
| `POST /v1/refills` | Create auto-refill (user) |

## Special Features

### Refill System
- Monitors order status.
- Auto-creates new order when count drops.
- Uses cron job (`src/cronJobs/`) to check periodically.

### Drip-Feed
- Gradual delivery split into intervals.
- Example: 1000 followers delivered 100/day over 10 days.
- Stored in `Order.dripFeed` and `Order.interval`.

### Affiliate/Referral
- `User.refCode`: Unique referral code.
- `User.ref`: Upline referrer.
- `ReferralOrder`: Tracks referral bonuses.

### Provider Integration
- Services linked to providers via `providerUid`.
- Orders sent to provider API on creation.
- Webhooks update order status.

## Error Handling

**Backend**:
- Validates input with Zod.
- Returns error.flatten() on validation failure.
- Clear error messages from business logic.

**Pattern**:
```typescript
export const placeOrder = async (req, res) => {
  const { data, error } = placeOrderSchema.safeParse(req.body);
  if (error) return res.status(400).json({ error: error.flatten() });
  
  const order = await prisma.order.create({ data });
  await sendOrderToProvider(order);
  
  res.status(201).json(order);
};
```

## Critical Patterns

### Tenant Scoping
Every DB query MUST include storeId:
```typescript
const orders = await prisma.order.findMany({
  where: { storeId, userUid: user.uid },
});
```

### Decimal for Prices
```typescript
const order = await prisma.order.create({
  data: {
    price: new Decimal("99.99"), // Never parseFloat()
  },
});
```

### Provider Sync
```typescript
const order = await createOrderInDB(...);
try {
  await sendOrderToProvider(order); // Must succeed
} catch (error) {
  // Log error, retry logic
}
```

## Development Workflow

1. **Identify Feature**: e.g., "Service custom pricing".
2. **Update Schema**: Add fields to `prisma/schema.prisma`.
3. **Generate**: `npm run prisma:generate`.
4. **Implement**: Controller → Service (if needed) → Route.
5. **Test**: Manual API testing via Swagger UI at `/swagger`.
6. **Deploy**: Build → run migrations → start.

## Known Constraints

- **Scale**: Each store shares DB; consider sharding for 10k+ stores.
- **Rate Limiting**: Global + per-endpoint limits applied.
- **Subscription**: Some features require active subscription.
- **Provider API**: Rate limits and reliability depend on external APIs.
