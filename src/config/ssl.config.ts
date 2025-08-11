import fs from "fs";
import tls, { SecureContext } from "tls";
import { prisma } from "./db.config";
import { env as processENV } from "./env.config";

const env = processENV.NODE_ENV;

type SSLOptions = {
  [domain: string]: {
    cert: Buffer;
    key: Buffer;
  };
};

const sslOptions: SSLOptions = {};

async function loadCertificates(): Promise<void> {
  const domains = await prisma.store.findMany({
    where: {
      ssl: true,
    },
    select: {
      uid: true,
    },
  });

  domains
    .filter(
      (domain) =>
        domain.uid !== "localhost:5173" && domain.uid !== "localhost:3000"
    )
    .forEach((domain) => {
      if (env === "production") {
        sslOptions[domain.uid] = {
          cert: fs.readFileSync(
            `/etc/letsencrypt/live/${domain.uid}/fullchain.pem`
          ),
          key: fs.readFileSync(
            `/etc/letsencrypt/live/${domain.uid}/privkey.pem`
          ),
        };
      }
    });
}

async function SNICallback(
  domain: string,
  cb: (err: Error | null, ctx?: SecureContext) => void
): Promise<void> {
  if (domain === "localhost:5173" || domain === "localhost:3000") {
    return cb(new Error("SSL certificate not available for localhost"));
  }

  let ctx = sslOptions[domain];

  if (!ctx) {
    const result = await prisma.store.findFirst({
      where: {
        uid: domain,
        ssl: true,
      },
      select: {
        uid: true,
        ssl: true,
      },
    });

    if (result?.ssl) {
      ctx = {
        cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`),
        key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`),
      };
      sslOptions[domain] = ctx;
    }
  }

  if (ctx) {
    cb(null, tls.createSecureContext(ctx));
  } else {
    cb(new Error(`No SSL certificate available for domain: ${domain}`));
  }
}

// Preload certificates at startup
loadCertificates();

export { sslOptions, SNICallback };
