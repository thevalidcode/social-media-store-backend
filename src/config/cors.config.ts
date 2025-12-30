import { CorsOptions, CorsRequest } from "cors";
import { env } from "./env.config";
import { prisma } from "./db.config";
import cors from "cors";

// --- Dynamic Host Setup ---
let allowedHosts: string[] = [];

export async function updateAllowedHosts(): Promise<void> {
  try {
    const stores = await prisma.store.findMany({
      where: { ssl: true },
    });

    const domains = stores.map((shop: any) => shop.uid);
    allowedHosts = [
      "localhost:3000",
      ...domains.map((domain: string) => `${domain}`),
    ];
  } catch (error) {
    console.error("Failed to update allowed hosts:", error);
  }
}

// Open CORS (dev/debug)
export const openCors = cors({ origin: true, credentials: true });

// Host-based dynamic Host
export const dynamicHost = (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) => {
  const host = req.headers.host;

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
