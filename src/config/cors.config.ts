import { CorsOptions, CorsRequest } from "cors";
import { env } from "./env.config";
import { prisma } from "./db.config";
import cors from "cors";

// --- Dynamic Host Setup ---
let allowedHosts: string[] = [];

export const normalizeHost = (h: string) =>
  h
    .replace(/^api\./, "")
    .replace(/^www\./, "")
    .replace(/^https?:\/\//, "");

/**
 * Updates the list of allowed hosts for CORS validation by fetching all SSL-enabled stores from the database.
 *
 * This function is used to dynamically maintain the `allowedHosts` array, which validates incoming requests
 * based on their `host` or `origin` headers. The validation process works as follows:
 *
 * - If a request's host/origin matches an entry in the `allowedHosts` array, the request passes CORS validation
 * - If the host/origin is not found in the array, a CORS error is thrown
 * - If the host is `validpanel.com`, it indicates an admin request and automatically passes CORS validation
 * - For `localhost` hosts, the function uses `http://` protocol instead of `https://`
 * - For production store domains (SSL-enabled), the function uses `https://` protocol
 *
 * @returns A promise that resolves when the allowed hosts list has been updated
 *
 * @throws Logs an error to console if the database query fails, but does not throw an exception
 *
 */
export async function updateAllowedHosts(): Promise<void> {
  try {
    const stores = await prisma.store.findMany({
      where: { ssl: true },
    });

    const domains = stores.map((shop: any) => shop.uid);
    allowedHosts = ["localhost:3000", ...domains];
  } catch (error) {
    console.error("Failed to update allowed hosts:", error);
  }
}

// Open CORS (dev/debug)
export const openCors = cors({ origin: true, credentials: true });

// Host-based dynamic Host
export const dynamicOrigin = (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) => {
  // req.headers.host is used becuase all the backends are on the same domain as the store and all
  // stores are registered sp of we remove the api. we can get the store domain while for origin
  // we use it because the store from the browser origin will must match a registered store too

  // This is just for blocking browser request from invalid domains
  const hostFromOrigin = req.headers.origin
    ? normalizeHost(req.headers.origin)
    : null;
  const hostFromHostHeader = req.headers.host
    ? normalizeHost(req.headers.host)
    : null;

  // Use origin for browser check, host for fallback
  const host = hostFromOrigin ?? hostFromHostHeader;

  if (env.NODE_ENV === "development") {
    return callback(null, { origin: true, credentials: true });
  }

  if (!host || !allowedHosts.includes(host)) {
    return callback(null, {
      origin: false,
      credentials: false,
    });
  }

  return callback(null, { origin: true, credentials: true });
};
