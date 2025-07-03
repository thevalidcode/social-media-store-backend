declare function getCurrentRates(): Promise<any>;
declare const saveRates: () => Promise<void>;
export { saveRates, getCurrentRates };
