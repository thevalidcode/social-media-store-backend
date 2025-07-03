import nodemailer from "nodemailer";
import { addPanelDoc, getDocs } from "../crud";
import { getTemplate } from "./templates";

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

async function loadGeneralSettings(panel_id: number) {
  const general = await getDocs("general", panel_id, {
    find: { field: "uid", operator: "===", value: "site" },
  });
  return general;
}

async function loadAdminEmails(panel_id: number): Promise<string[]> {
  const docs = await getDocs("admin_emails", panel_id);
  return docs.map((doc: any) => doc.email);
}

async function buildEmailTemplate(
  type: string,
  data: Record<string, any>,
  logo_url: string,
  panel_id: number
): Promise<{ subject: string; html: string }> {
  const template = await getDocs("email_templates", panel_id, {
    find: { type },
  });

  const variables = { logo: logo_url, ...data };
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
  panel_id,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  panel_id: number;
}): Promise<boolean> {
  try {
    const result = await transporter.sendMail({ from, to, subject, html });

    await addPanelDoc(
      "notifications",
      {
        from,
        to,
        subject,
        html,
        status: "success",
        timestamp: new Date(),
        messageId: result.messageId,
        response: result.response,
      },
      panel_id
    );

    return true;
  } catch (err: any) {
    await addPanelDoc(
      "notifications",
      {
        from,
        to,
        subject,
        html,
        status: "error",
        timestamp: new Date(),
        response: err.message,
      },
      panel_id
    );
    return false;
  }
}

export async function sendEmail(
  from = '"Valid Panel" <contact@validpanel.com>',
  type: string,
  data: Record<string, any>,
  panel_id: number
): Promise<void> {
  try {
    if (type === "new_order" && data.price <= 0) return;

    const [logo, recipients] = await Promise.all([
      loadGeneralSettings(panel_id).then((g) => g.logo_url),
      loadAdminEmails(panel_id),
    ]);

    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      logo,
      panel_id
    );

    await Promise.all(
      recipients.map((to) =>
        dispatchEmail({ from, to, subject, html, panel_id })
      )
    );
  } catch (err: any) {
    console.error({ error: err.message });
  }
}

export async function sendUserEmail(
  from = '"Panel" <contact@validpanel.com>',
  to: string,
  type: string,
  data: Record<string, any>,
  panel_id: number
): Promise<void> {
  try {
    const logo = (await loadGeneralSettings(panel_id)).logo_url;
    const { subject, html } = await buildEmailTemplate(
      type,
      data,
      logo,
      panel_id
    );
    await dispatchEmail({ from, to, subject, html, panel_id });
  } catch (err: any) {
    console.error({ error: err.message });
  }
}
