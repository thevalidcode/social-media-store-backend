interface NewSupportVars {
    id: number | string;
    subject: string;
    user: string;
    message: string;
    logo: string;
}
interface NewMessageVars {
    ticket_id: string | number;
    user: string;
    content: string;
    logo: string;
}
declare const newSupport: ({ id, subject, user, message, logo, }: NewSupportVars) => string;
declare const newMessage: ({ ticket_id, user, content, logo, }: NewMessageVars) => string;
export { newSupport, newMessage };
