// backend/src/emails/components/EmailLayout.ts
export interface EmailLayoutProps {
  subject: string;
  children: string; // HTML content for the body
  logoUrl?: string;
  storeName?: string;
  storeUrl?: string;
}

export interface TemplateResult {
  subject: string;
  html: string;
}

export interface LogoVars {
  logo: string;
  storeName: string;
  storeUrl: string;
}

export const Header = (logoUrl?: string, storeName?: string) => `
  <tr>
    <td style="padding:20px; text-align:center; background:#7C3AED;">
      <img src="${
        logoUrl || "https://via.placeholder.com/120x40?text=Logo"
      }" alt="${storeName || "Store"}" width="120" style="display:block; margin:auto;">
    </td>
  </tr>
`;

export const Footer = (storeName?: string, storeUrl?: string) => `
  <tr>
    <td style="padding:20px; text-align:center; font-size:12px; color:#888;">
      &copy; ${new Date().getFullYear()} ${storeName || "Our Store"}. All rights reserved.<br/>
      <a href="${storeUrl || "#"}" style="color:#7C3AED; text-decoration:none;">Visit our website</a>
    </td>
  </tr>
`;

export const Layout = ({
  subject,
  children,
  logoUrl,
  storeName,
  storeUrl,
}: EmailLayoutProps): TemplateResult => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#F9FAFB;">
  <table role="presentation" style="width:100%; max-width:600px; margin:auto; background:#fff; border-collapse:collapse;">
    ${Header(logoUrl, storeName)}
    <tr>
      <td style="padding:30px; font-size:16px; color:#333;">
        ${children}
      </td>
    </tr>
    ${Footer(storeName, storeUrl)}
  </table>
</body>
</html>
`;
  return { subject, html };
};
