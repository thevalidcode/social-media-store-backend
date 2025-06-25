export declare const verifyGoogleIdToken: (idToken: string) => Promise<{
    email: string;
    name: string;
    avatar: string;
    googleId: string;
    picture: string;
}>;
