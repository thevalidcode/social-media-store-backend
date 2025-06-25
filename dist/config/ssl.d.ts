import { SecureContext } from "tls";
type SSLOptions = {
    [domain: string]: {
        cert: Buffer;
        key: Buffer;
    };
};
declare const sslOptions: SSLOptions;
declare function SNICallback(domain: string, cb: (err: Error | null, ctx?: SecureContext) => void): Promise<void>;
export { sslOptions, SNICallback };
