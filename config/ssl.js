import fs from "fs";
import tls from "tls";
import { getDocs } from "../crud.js";

const env = process.env.NODE_ENV;

const sslOptions = {};

async function loadCertificates() {
  const domains = await getDocs("registered_panels", null, {
    filter: { field: "ssl", operator: "===", value: true },
  });

  domains
    .filter(
      (domain) =>
        domain.uid !== "localhost:5173" && domain.uid !== "localhost:3000"
    ) // remove localhost:3000 explicitly
    .forEach((domain) => {
      sslOptions[domain.uid] = env === "production" && {
        cert: fs.readFileSync(
          `/etc/letsencrypt/live/${domain.uid}/fullchain.pem`
        ),
        key: fs.readFileSync(`/etc/letsencrypt/live/${domain.uid}/privkey.pem`),
      };
    });
}

async function SNICallback(domain, cb) {
  if (domain === "localhost:5173" || domain === "localhost:3000") {
    return cb(new Error("SSL certificate not available for localhost"));
  }

  let ctx = sslOptions[domain];

  if (!ctx) {
    const newDomain = await getDocs("registered_panels", null, {
      find: { field: "uid", operator: "===", value: domain },
    });

    if (newDomain && newDomain.ssl) {
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
    cb(new Error("No SSL certificate available for domain: " + domain));
  }
}

loadCertificates();

export { sslOptions, SNICallback };
