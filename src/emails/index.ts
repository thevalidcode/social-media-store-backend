import nodemailer from "nodemailer";
import { prisma } from "../config/db.config";
import { EmailTemplateVars, getTemplate } from "./templates";
import {
  extractColorsFromSchema,
  DesignColors,
} from "./components/EmailLayout";

interface DispatchEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  storeId: number;
}

interface StoreSettings {
  logoUrl: string;
  storeName: string;
  storeUrl: string;
  faviconUrl: string;
  designColors?: DesignColors;
  features: {
    store_email_notifications: boolean;
    store_custom_emails: boolean;
  };
}

// ----------------------------
// Transporter Setup
// ----------------------------
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

// ----------------------------
// Utility: Interpolation
// ----------------------------
function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => variables[key.trim()] ?? ""
  );
}

// ----------------------------
// Load Store-Specific Settings
// ----------------------------
async function loadStoreSettings(storeId: number): Promise<StoreSettings> {
  const setting = await prisma.setting.findUnique({
    where: { storeId },
    include: { store: true },
  });

  if (!setting) {
    throw new Error(`Settings not found for store ID: ${storeId}`);
  }

  const storeUrl = setting.store.ssl
    ? `https://${setting.store.uid}`
    : `http://${setting.store.uid}`;

  // Extract features from store
  const features = (setting.store.features as any) || {};
  const storeEmailNotifications = features.store_email_notifications ?? true;
  const storeCustomEmails = features.store_custom_emails ?? true;

  // Check if email notifications are enabled for this store
  if (!storeEmailNotifications) {
    throw new Error(
      `Email notifications are disabled for store ID: ${storeId}`
    );
  }

  // Fetch design styles for the store
  const designStyle = await prisma.designStyle.findFirst({
    where: { storeId },
  });

  // Extract colors from design schema if available
  let designColors: DesignColors | undefined;
  if (designStyle && designStyle.schema) {
    try {
      designColors = extractColorsFromSchema(designStyle.schema);
    } catch (error) {
      console.error(`Failed to extract colors for store ${storeId}:`, error);
      // designColors will remain undefined, templates will use defaults
    }
  }

  return {
    logoUrl: setting.logoUrl || "",
    storeName: setting.storeName || "My Store",
    storeUrl,
    faviconUrl: setting.faviconUrl || "",
    designColors,
    features: {
      store_email_notifications: storeEmailNotifications,
      store_custom_emails: storeCustomEmails,
    },
  };
}

// ----------------------------
// Build Email Template
// ----------------------------
export async function buildEmailTemplate(
  type: keyof EmailTemplateVars,
  data: Record<string, any>,
  storeSettings: StoreSettings,
  storeId: number
): Promise<{ subject: string; html: string }> {
  const template = await prisma.emailTemplate.findFirst({
    where: { type, storeId },
  });

  const variables = {
    logo: storeSettings.logoUrl,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    ...data,
  };

  const htmlFromDb = template ? interpolate(template.content, variables) : "";
  const fallback = getTemplate(type, variables, storeSettings);
  const newSubject = template?.subject || fallback.subject;

  return {
    subject: newSubject,
    html: htmlFromDb || fallback.html,
  };
}

// ----------------------------
// Dispatch Email & Log
// ----------------------------
async function dispatchEmail({
  from,
  to,
  subject,
  html,
  storeId,
}: DispatchEmailParams): Promise<boolean> {
  try {
    const result = await transporter.sendMail({ from, to, subject, html });

    // Get the store counter for this store
    const counter = await prisma.storeCounter.findUnique({
      where: { storeId },
    });

    if (!counter) {
      throw new Error(`Store counter not found for store ID: ${storeId}`);
    }

    // Increment and get new counter value
    const updatedCounter = await prisma.storeCounter.update({
      where: { storeId },
      data: { emailLogCounter: { increment: 1 } },
    });

    await prisma.emailLog.create({
      data: {
        storeScopedId: updatedCounter.emailLogCounter,
        sender: from,
        receiver: to,
        subject,
        html,
        status: "SUCCESS",
        messageId: result.messageId,
        response: result.response,
        storeId,
        timestamp: new Date(),
      },
    });

    return true;
  } catch (err: any) {
    // Try to log error even if counter increment failed
    try {
      const counter = await prisma.storeCounter.findUnique({
        where: { storeId },
      });

      if (counter) {
        const updatedCounter = await prisma.storeCounter.update({
          where: { storeId },
          data: { emailLogCounter: { increment: 1 } },
        });

        await prisma.emailLog.create({
          data: {
            storeScopedId: updatedCounter.emailLogCounter,
            sender: from,
            receiver: to,
            subject,
            html,
            status: "ERROR",
            response: err.message,
            storeId,
            timestamp: new Date(),
          },
        });
      }
    } catch (logErr) {
      console.error(`Failed to log email error:`, logErr);
    }

    console.error(`Failed to send email to ${to}:`, err.message);
    return false;
  }
}

// ----------------------------
// Send Email to Admins
// ----------------------------
export async function sendEmailToAdmins(
  storeId: number,
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    const storeSettings = await loadStoreSettings(storeId);
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      storeSettings,
      storeId
    );

    // Get admin emails for this store
    const adminEmails = await prisma.adminEmail.findFirst({
      where: { storeId },
    });

    // Determine sender email based on store_custom_emails feature
    const from = storeSettings.features.store_custom_emails
      ? `"${storeSettings.storeName}" <noreply@${storeSettings.storeUrl.replace(
          /^https?:\/\//,
          ""
        )}>`
      : `"${storeSettings.storeName}" <social-media-store@validpanel.com>`;

    const recipients = adminEmails?.emails || [];

    if (recipients.length === 0) {
      console.warn(`No admin emails configured for store ID: ${storeId}`);
      return;
    }

    // Send to all admin emails
    for (const to of recipients) {
      await dispatchEmail({ from, to, subject, html, storeId });
    }
  } catch (err: any) {
    console.error(
      `sendEmailToAdmins error for store ${storeId}: ${err.message}`
    );
  }
}

// ----------------------------
// Send Email to a User
// ----------------------------
export async function sendUserEmail(
  storeId: number,
  to: string,
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    const storeSettings = await loadStoreSettings(storeId);
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      storeSettings,
      storeId
    );

    // Determine sender email based on store_custom_emails feature
    const from = storeSettings.features.store_custom_emails
      ? `"${storeSettings.storeName}" <noreply@${storeSettings.storeUrl.replace(
          /^https?:\/\//,
          ""
        )}>`
      : `"${storeSettings.storeName}" <social-media-store@validpanel.com>`;

    await dispatchEmail({ from, to, subject, html, storeId });
  } catch (err: any) {
    console.error(
      `sendUserEmail error for ${to} in store ${storeId}: ${err.message}`
    );
  }
}

// ----------------------------
// Backward Compatible: Send Email
// (Used by providers for admin notifications)
// ----------------------------
export async function sendEmail(
  to: string | undefined,
  type: string,
  data: Record<string, any>,
  storeId: number
): Promise<void> {
  // If no recipient specified, send to admins
  if (!to) {
    await sendEmailToAdmins(storeId, type as keyof EmailTemplateVars, data);
  } else {
    await sendUserEmail(storeId, to, type as keyof EmailTemplateVars, data);
  }
}
