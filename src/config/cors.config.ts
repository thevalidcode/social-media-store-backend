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
      ...domains.map((domain: string) => `${domain}`), // no https://, just host
    ];
  } catch (error) {
    console.error("Failed to update allowed hosts:", error);
  }
}

// Open CORS (dev/debug)
export const openCors = cors({ origin: true, credentials: true });

// Host-based dynamic CORS
export const dynamicCors = function (
  req: CorsRequest,
  callback: (err: Error | null, options?: CorsOptions) => void
) {
  const host = req.headers.host; // ✅ always present

  if (env.NODE_ENV === "development") {
    return callback(null, { origin: true, credentials: true });
  }

  if (!host) {
    return callback(new Error("Host header is required"), { origin: false });
  }

  if (allowedHosts.includes(host)) {
    return callback(null, { origin: true, credentials: true });
  }

  return callback(new Error(`Host ${host} not allowed by CORS`), {
    origin: false,
  });
};
