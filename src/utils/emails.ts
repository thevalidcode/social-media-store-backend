import nodemailer from "nodemailer";
import { addPanelDoc, getDocs, updatePanelDoc } from "../crud";
import { getTemplate } from "./emailTemplates";

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

function interpolateHtml(html: string, variables: Record<string, any>): string {
  return html.replace(/\{\{(.*?)\}\}/g, (_, variableName) => {
    return variables[variableName.trim()] || "";
  });
}

async function getEmailTemplate(
  type: string,
  data: Record<string, any>,
  logo_url: string,
  panel_id: number
): Promise<{ subject: string; html: string }> {
  const template = await getDocs("email_templates", panel_id, {
    find: { type },
  });

  const variables = {
    logo: logo_url,
    ...data,
  };

  if (!template) {
    await updatePanelDoc("email_templates", template.uid, { type }, panel_id);
  }

  const interpolatedHtml = interpolateHtml(template?.content || "", variables);
  const defaultTemplate = getTemplate(type as any, variables); // fallback
  const htmlTemplate = interpolatedHtml || defaultTemplate;

  return {
    subject: `${type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()} Notification`,
    html: htmlTemplate,
  };
}

async function sendEmailConfig(
  from: string,
  to: string,
  type: string,
  data: Record<string, any>,
  logo_url: string,
  panel_id: number
): Promise<{ success: boolean }> {
  const emailTemplate = await getEmailTemplate(type, data, logo_url, panel_id);

  try {
    const mailOptions = {
      from,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const info = await transporter.sendMail(mailOptions);

    await addPanelDoc(
      "notifications",
      {
        from,
        to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        timestamp: new Date(),
        status: "success",
        messageId: info.messageId,
        response: info.response,
      },
      panel_id
    );

    return { success: true };
  } catch (error: any) {
    await addPanelDoc(
      "notifications",
      {
        from,
        to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        timestamp: new Date(),
        status: "error",
        response: error.message,
      },
      panel_id
    );

    return { success: false };
  }
}

async function sendEmail(
  from = '"Valid Panel" <contact@validpanel.com>',
  type: string,
  data: Record<string, any>,
  panel_id: number
): Promise<void> {
  try {
    if (type === "new_order" && data.price <= 0) return;

    const adminEmails = await getDocs("admin_emails", panel_id);
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });

    for (const doc of adminEmails) {
      await sendEmailConfig(
        from,
        doc.email,
        type,
        data,
        general.logo_url,
        panel_id
      );
    }
  } catch (error: any) {
    console.error({ error: error.message });
  }
}

async function sendUserEmail(
  from = '"Panel" <contact@validpanel.com>',
  to: string,
  type: string,
  data: Record<string, any>,
  panel_id: number
): Promise<void> {
  try {
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });
    await sendEmailConfig(from, to, type, data, general.logo_url, panel_id);
  } catch (error: any) {
    console.error({ error: error.message });
  }
}

export { sendEmail, sendUserEmail };
