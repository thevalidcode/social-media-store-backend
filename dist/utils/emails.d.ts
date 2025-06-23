declare function sendEmail(from: string | undefined, type: string, data: Record<string, any>, panel_id: number): Promise<void>;
declare function sendUserEmail(from: string | undefined, to: string, type: string, data: Record<string, any>, panel_id: number): Promise<void>;
export { sendEmail, sendUserEmail };
