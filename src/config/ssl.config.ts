import fs from "fs";
import path from "path";
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

const CADDY_CERTS_PATH =
  "/var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory";

async function loadCertificates(): Promise<void> {
  const domains = await prisma.store.findMany({
    where: { ssl: true },
    select: { uid: true },
  });

  domains
    .filter(
      (domain) =>
        domain.uid !== "localhost:5173" && domain.uid !== "localhost:3000"
    )
    .forEach((domain) => {
      if (env === "production") {
        const domainDir = path.join(CADDY_CERTS_PATH, domain.uid);
        try {
          sslOptions[domain.uid] = {
            cert: fs.readFileSync(path.join(domainDir, `${domain.uid}.crt`)),
            key: fs.readFileSync(path.join(domainDir, `${domain.uid}.key`)),
          };
        } catch (e) {
          console.warn(`Could not load certs for ${domain.uid}: ${e}`);
        }
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
      where: { uid: domain, ssl: true },
      select: { uid: true, ssl: true },
    });

    if (result?.ssl) {
      const domainDir = path.join(CADDY_CERTS_PATH, domain);
      try {
        ctx = {
          cert: fs.readFileSync(path.join(domainDir, `${domain}.crt`)),
          key: fs.readFileSync(path.join(domainDir, `${domain}.key`)),
        };
        sslOptions[domain] = ctx;
      } catch (e) {
        return cb(new Error(`Failed loading certs for ${domain}: ${e}`));
      }
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
