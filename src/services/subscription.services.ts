import { coreApiRequest } from "../lib/apiClient";
import { redisService } from "./redis.services";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { SubscriptionPlanFeatures } from "../schemas/store.schema";
import { prisma } from "../config/db.config";

// Cache TTL in seconds (5-10 minutes)
const SUBSCRIPTION_CACHE_TTL = 5 * 60; // 5 minutes
const STORE_CACHE_TTL = 10 * 60; // 10 minutes

export type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "FAILED"
  | "EXPIRED"
  | "TRIAL"
  | "PAST_DUE"
  | "CANCELED";

export type BillingInterval = "MONTHLY" | "YEARLY";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  status: string;
  features: SubscriptionPlanFeatures;
  createdAt: string;
  updatedAt: string;
  gracePeriod: number | null;
}

export interface Subscription {
  id: number;
  uid: string;
  userId: number;
  planId: number;
  pendingPlanId: number | null;
  status: SubscriptionStatus;
  billingCycle: BillingInterval;
  startedAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  renewalProcessingAt: string | null;
  renewedAt: string | null;
  plan: SubscriptionPlan;
}

export interface StoreData {
  storeId: number;
  uid: string;
  name: string;
  logoUrl: string | null;
  color: string | null;
  description: string | null;
  ssl: boolean;
  plan: string;
  type: string;
  status: string;
  resellingEnabled: boolean;
  timestamp: string;
  ownerId: number;
}

class SubscriptionService {
  /**
   * Generate internal service JWT token for authentication
   * @param adminUid - The admin user UID to include in the token
   */
  private generateInternalToken(adminUid: string, storeId: number): string {
    const payload = {
      storeId: storeId,
      iss: "social-media-store",
      uid: adminUid,
    };

    return jwt.sign(payload, env.INTERNAL_SERVICE_USER_JWT_SECRET, {
      expiresIn: "5m",
    });
  }

  /**
   * Get subscription by userId (with Redis cache)
   * @param userId - The Core Platform user ID (owner)
   * @param storeId - The store ID to get admin UID from
   * Note: Core Platform returns the latest subscription regardless of status
   */
  async getSubscription(storeId: number): Promise<Subscription | null> {
    const cacheKey = `subscription:${storeId}`;

    // Try to get from cache
    const cached = await redisService.get<Subscription>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get an admin from this store to use their UID for authentication
      const admin = await prisma.admin.findFirst({
        where: { storeId },
        select: { uid: true },
      });

      if (!admin) {
        return null;
      }

      // Generate internal token with admin UID
      const token = this.generateInternalToken(admin.uid, storeId);

      // Fetch from Core API
      const response = await coreApiRequest<{ subscription: Subscription }>({
        endpoint: "/internal/subscription",
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const subscription = response.subscription;

      // Cache the result
      await redisService.set(cacheKey, subscription, SUBSCRIPTION_CACHE_TTL);

      return subscription;
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Get store data by storeId (with Redis cache)
   * @param storeId - The store ID to fetch
   */
  async getStoreData(storeId: number): Promise<StoreData | null> {
    const cacheKey = `store:${storeId}`;

    // Try to get from cache
    const cached = await redisService.get<StoreData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get an admin from this store to use their UID for authentication
      const admin = await prisma.admin.findFirst({
        where: { storeId },
        select: { uid: true },
      });

      if (!admin) {
        return null;
      }

      // Generate internal token with admin UID
      const token = this.generateInternalToken(admin.uid, storeId);

      // Fetch from Core API
      const response = await coreApiRequest<{ store: StoreData }>({
        endpoint: `/internal/store?storeId=${storeId}`,
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const store = response.store;

      // Cache the result
      await redisService.set(cacheKey, store, STORE_CACHE_TTL);

      return store;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Invalidate subscription cache for a user
   */
  async invalidateSubscriptionCache(storeId: number): Promise<void> {
    const cacheKey = `subscription:${storeId}`;
    await redisService.del(cacheKey);
  }

  /**
   * Invalidate store cache
   */
  async invalidateStoreCache(storeId: number): Promise<void> {
    const cacheKey = `store:${storeId}`;
    await redisService.del(cacheKey);
  }

  /**
   * Get subscription with validation
   * @param userId - The Core Platform user ID (owner)
   * @param storeId - The store ID to get admin UID from
   * Note: Core Platform now returns latest subscription regardless of status
   */
  async getValidatedSubscription(storeId: number): Promise<{
    valid: boolean;
    subscription: Subscription | null;
    reason?: string;
  }> {
    const subscription = await this.getSubscription(storeId);

    if (!subscription) {
      return {
        valid: false,
        subscription: null,
        reason: "No subscription found",
      };
    }

    // Check if subscription is active
    if (subscription.status !== "ACTIVE") {
      return {
        valid: false,
        subscription,
        reason: `Subscription is ${subscription.status.toLowerCase()}`,
      };
    }

    // Check if subscription has expired
    if (subscription.expiresAt) {
      const expirationDate = new Date(subscription.expiresAt);
      const now = new Date();

      if (expirationDate < now) {
        return {
          valid: false,
          subscription,
          reason: "Subscription has expired",
        };
      }
    }

    return {
      valid: true,
      subscription,
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
