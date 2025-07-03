interface NewOrderVars {
    username: string;
    id: number | string;
    url: string;
    number: number;
    price: number;
    user_balance: number;
    service_id: number | string;
    provider: string;
    logo: string;
}
interface FailedOrderVars extends NewOrderVars {
    provider_error: string;
}
export declare const newOrder: ({ username, id, url, number, price, user_balance, service_id, provider, logo, }: NewOrderVars) => string;
export declare const newFailedOrder: ({ username, id, logo, url, number, user_balance, service_id, price, provider, provider_error, }: FailedOrderVars) => string;
export {};
