import nodemailer from 'nodemailer';import {  addPanelDoc, getDocs, updatePanelDoc  } from '../crud.js';
import {  getTemplate  } from './emailTemplates.js';

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

const interpolateHtml = (html, variables) => {
  return html.replace(/\{\{(.*?)\}\}/g, (_, variableName) => {
    return variables[variableName.trim()] || "";
  });
};

const getEmailTemplate = async (type, data, logo_url, panel_id) => {
  const templates = await getDocs("notifications", panel_id, {
    find: { field: "uid", operator: "===", value: "email_templates" },
  });

  const variables = {
    logo: logo_url,
    ...data,
  };

  if (!templates[type]) {
    await updatePanelDoc(
      "notifications",
      "email_templates",
      { [type]: "" },
      panel_id
    );
  }
  const interpolatedHtml = interpolateHtml(templates[type] || "", variables);
  const defaultTemplate = getTemplate(type, variables);
  const htmlTemplate = interpolatedHtml ? interpolatedHtml : defaultTemplate;

  return {
    subject: `${type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()} Notification`,
    html: htmlTemplate,
  };
};

const sendEmailConfig = async (from, to, type, data, logo_url, panel_id) => {
  const emailTemplate = await getEmailTemplate(type, data, logo_url, panel_id);
  try {
    const mailOptions = {
      from,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    let info = await transporter.sendMail(mailOptions);
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
  } catch (error) {
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
};

const sendEmail = async (
  from = '"Valid Panel" <contact@validpanel.com>',
  type,
  data,
  panel_id
) => {
  try {
    if (type === "new_order" && data.price <= 0) return;
    const adminEmails = await getDocs("notifications", panel_id, {
      find: { field: "uid", operator: "===", value: "admin_emails" },
    }).emails;
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });

    adminEmails.map((email) =>
      sendEmailConfig(from, email, type, data, general.logo_url, panel_id)
    );
  } catch (error) {
    console.error({ error });
  }
};

const sendUserEmail = async (
  from = '"Panel" <contact@validpanel.com>',
  to,
  type,
  data,
  panel_id
) => {
  try {
    const general = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });
    sendEmailConfig(from, to, type, data, general.logo_url, panel_id);
  } catch (error) {
    console.error({ error });
  }
};

export {  sendEmail, sendUserEmail  };
