import { StoreError } from "../errors/store.error";

const RESERVED_SUBDOMAINS = new Set([
  // Core / Brand
  "valid",
  "validpanel",
  "valid-panels",
  "vp",

  // System & Infrastructure
  "www",
  "root",
  "sys",
  "system",
  "internal",
  "private",
  "public",
  "server",
  "servers",
  "node",
  "nodes",
  "cluster",
  "edge",
  "cdn",
  "proxy",
  "gateway",
  "loadbalancer",

  // Auth / Security
  "auth",
  "authentication",
  "authorize",
  "login",
  "logout",
  "signin",
  "signup",
  "register",
  "session",
  "sessions",
  "token",
  "tokens",
  "oauth",
  "sso",
  "jwt",
  "security",
  "secure",
  "verify",
  "verification",
  "2fa",
  "mfa",
  "captcha",

  // API & Dev
  "api",
  "apis",
  "rest",
  "graphql",
  "gql",
  "rpc",
  "webhook",
  "webhooks",
  "callback",
  "callbacks",
  "sdk",
  "dev",
  "developer",
  "developers",
  "sandbox",
  "staging",
  "stage",
  "test",
  "testing",
  "mock",

  // Admin / Management
  "admin",
  "admins",
  "administrator",
  "management",
  "manage",
  "dashboard",
  "control",
  "controlpanel",
  "panel",
  "console",
  "moderation",
  "moderator",
  "staff",
  "team",
  "ops",
  "operations",

  // User / Account
  "user",
  "users",
  "account",
  "accounts",
  "profile",
  "profiles",
  "settings",
  "preferences",

  // Commerce / Billing / Finance
  "billing",
  "billings",
  "payment",
  "payments",
  "pay",
  "checkout",
  "invoice",
  "invoices",
  "subscription",
  "subscriptions",
  "plan",
  "plans",
  "pricing",
  "price",
  "wallet",
  "wallets",
  "balance",
  "balances",
  "fund",
  "funds",
  "deposit",
  "withdraw",
  "withdrawal",
  "refund",
  "refunds",
  "chargeback",
  "chargebacks",
  "crypto",
  "fiat",
  "bank",
  "banks",
  "card",
  "cards",

  // Stores / Commerce Features
  "store",
  "stores",
  "shop",
  "shops",
  "market",
  "marketplace",
  "product",
  "products",
  "order",
  "orders",
  "cart",
  "carts",
  "inventory",
  "stock",
  "shipping",
  "delivery",
  "returns",

  // Social / Media / Panels
  "social",
  "socialmedia",
  "media",
  "stream",
  "streams",
  "panel",
  "panels",
  "boost",
  "boosts",
  "engagement",
  "likes",
  "followers",
  "views",
  "traffic",

  // Content / Marketing
  "blog",
  "blogs",
  "news",
  "press",
  "promo",
  "promotions",
  "campaign",
  "campaigns",
  "ads",
  "advert",
  "advertising",
  "seo",
  "analytics",
  "stats",
  "statistics",
  "insights",
  "reports",

  // Support / Legal
  "support",
  "help",
  "helpdesk",
  "ticket",
  "tickets",
  "status",
  "uptime",
  "incident",
  "incidents",
  "issue",
  "issues",
  "legal",
  "terms",
  "privacy",
  "policy",
  "policies",
  "compliance",
  "gdpr",
  "dmca",

  // Files / Assets
  "static",
  "assets",
  "images",
  "img",
  "mediafiles",
  "uploads",
  "downloads",
  "files",
  "storage",
  "backup",
  "backups",

  // Email / Messaging
  "mail",
  "email",
  "smtp",
  "imap",
  "pop",
  "newsletter",
  "notifications",
  "notify",
  "message",
  "messages",
  "chat",
  "chats",

  // Monitoring / Logs
  "log",
  "logs",
  "monitor",
  "monitoring",
  "health",
  "metrics",
  "alerts",

  // Abuse / Scam / Risk (prevention)
  "free",
  "trial",
  "bonus",
  "promo-code",
  "coupon",
  "giveaway",
  "hack",
  "hacks",
  "cracker",
  "crack",
  "exploit",
  "exploiters",
  "spam",
  "scam",
  "fraud",
  "fake",
  "phish",
  "phishing",

  // Common mistakes / collisions
  "null",
  "undefined",
  "true",
  "false",
  "localhost",
  "local",
  "example",
  "sample",
  "demo",
  "temp",
  "tmp",
]);

export function assertValidDomain(domain: string) {
  const normalized = domain.toLowerCase().trim();

  // Basic domain regex (covers normal domains and subdomains)
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

  if (!domainRegex.test(normalized)) {
    throw new StoreError("INVALID_DOMAIN", "Invalid domain format");
  }

  // Check if this is a validpanel.com subdomain
  if (normalized.endsWith(".validpanel.com")) {
    // Extract the subdomain part (everything before .validpanel.com)
    const subdomainPart = normalized.replace(/\.validpanel\.com$/, "");

    // Split nested subdomains and check each segment against reserved names
    const segments = subdomainPart.split(".");
    for (const segment of segments) {
      if (RESERVED_SUBDOMAINS.has(segment)) {
        throw new StoreError(
          "RESERVED_SUBDOMAIN",
          `The subdomain segment "${segment}" is reserved and cannot be used`
        );
      }

      // Validate each segment's format
      const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
      if (!subdomainRegex.test(segment)) {
        throw new StoreError(
          "INVALID_SUBDOMAIN_SEGMENT",
          `Invalid subdomain segment format: "${segment}"`
        );
      }
    }
  }

  return true;
}
