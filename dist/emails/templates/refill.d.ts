interface RefillVars {
    id: number | string;
    order_id: string;
    username: string;
    number: number;
    price: number;
    provider: string;
    logo: string;
}
interface FailedRefillVars extends RefillVars {
    error: string;
}
export declare const newRefill: ({ id, username, logo, provider, order_id, price, number, }: RefillVars) => string;
export declare const newFailedRefill: ({ id, username, logo, provider, order_id, price, number, error, }: FailedRefillVars) => string;
export {};
