import { prisma } from "../config/db";
import nodemailer from "nodemailer";
import { getTemplate } from "./templates";
import { v4 as uuidv4 } from "uuid";

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => variables[key.trim()] ?? ""
  );
}

async function loadGeneralSettings(storeId: number) {
  return prisma.general.findFirst({
    where: { storeId },
    orderBy: { id: "asc" },
  });
}

async function loadAdminEmails(storeId: number): Promise<string[]> {
  const docs = await prisma.adminEmail.findMany({
    where: { storeId },
    select: { emails: true },
  });
  return docs.flatMap((doc) => doc.emails);
}

async function buildEmailTemplate(
  type: string,
  data: Record<string, any>,
  logoUrl: string,
  storeId: number
): Promise<{ subject: string; html: string }> {
  const template = await prisma.emailTemplate.findFirst({
    where: { storeId, type },
    select: { content: true },
  });

  const variables = { logo: logoUrl || "", ...data };
  const htmlFromDb = interpolate(template?.content || "", variables);
  const fallbackHtml = getTemplate(type as any, variables);

  const subject =
    type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim() + " Notification";

  return {
    subject,
    html: htmlFromDb || fallbackHtml,
  };
}

async function dispatchEmail({
  from,
  to,
  subject,
  html,
  storeId,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  storeId: number;
}): Promise<boolean> {
  try {
    const result = await transporter.sendMail({ from, to, subject, html });

    await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { emailLogCounter: { increment: 1 } },
      });

      await tx.emailLog.create({
        data: {
          storeId,
          sender: from,
          receiver: to,
          subject,
          html,
          uid: uuidv4(),
          status: "success",
          storeScopedId: counter.emailLogCounter,
          timestamp: new Date(),
          messageId: result.messageId,
          response: result.response,
        },
      });
    });

    return true;
  } catch (err: any) {
    await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { emailLogCounter: { increment: 1 } },
      });

      await tx.emailLog.create({
        data: {
          storeId,
          sender: from,
          receiver: to,
          subject,
          html,
          uid: uuidv4(),
          status: "error",
          storeScopedId: counter.emailLogCounter,
          timestamp: new Date(),
          response: err.message,
        },
      });
    });
    return false;
  }
}

export async function sendEmail(
  from = '"Valid Panel" <contact@validpanel.com>',
  type: string,
  data: Record<string, any>,
  storeId: number
): Promise<void> {
  try {
    if (type === "newOrder" && data.price <= 0) return;

    const [generalSettings, recipients] = await Promise.all([
      loadGeneralSettings(storeId),
      loadAdminEmails(storeId),
    ]);

    const logoUrl = generalSettings?.logoUrl || "";
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      logoUrl,
      storeId
    );

    await Promise.all(
      recipients.map((to) =>
        dispatchEmail({ from, to, subject, html, storeId })
      )
    );
  } catch (err: any) {
    console.error({ error: err.message });
  }
}

export async function sendUserEmail(
  from = '"Store" <notifications@validpanel.com>',
  to: string,
  type: string,
  data: Record<string, any>,
  storeId: number
): Promise<void> {
  try {
    const generalSettings = await loadGeneralSettings(storeId);
    const logoUrl = generalSettings?.logoUrl || "";
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      logoUrl,
      storeId
    );
    await dispatchEmail({ from, to, subject, html, storeId });
  } catch (err: any) {
    console.error({ error: err.message });
  }
}
