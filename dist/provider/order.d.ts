type ProviderOrderResult = {
    success?: string;
    error?: string | object;
};
export declare const sendOrderToProvider: (order: any, panel_id: number) => Promise<ProviderOrderResult>;
export declare const sendUnsyncedOrders: () => Promise<void>;
export declare const syncOrderDetails: (orderData: any, panel_id: number) => Promise<boolean>;
export declare const syncAllPanelsOrderDetails: () => Promise<void>;
export declare const processDripFeedOrders: () => Promise<void>;
export {};
