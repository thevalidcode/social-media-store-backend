interface VerificationCodeVars {
    username: string;
    verification_code: string;
    company: string;
    logo: string;
}
interface NewUserVars {
    username: string;
    email: string;
    id: number | string;
    logo: string;
}
interface FundsAddedVars {
    username: string;
    amount: number;
    currency: string;
    method: string;
    logo: string;
}
declare const verificationCode: ({ username, verification_code, company, logo, }: VerificationCodeVars) => string;
declare const newUser: ({ username, email, id, logo }: NewUserVars) => string;
declare const fundsAdded: ({ username, amount, currency, method, logo, }: FundsAddedVars) => string;
export { verificationCode, newUser, fundsAdded };
