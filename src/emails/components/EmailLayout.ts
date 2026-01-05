// backend/src/emails/components/EmailLayout.ts
import { colorToHex } from "../utils/colorUtils";
import { DEFAULT_EMAIL_COLORS } from "../constants/defaultColors";

export interface DesignColors {
  primary: string;
  primaryForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  accent: string;
  accentForeground: string;
}

export interface EmailLayoutProps {
  subject: string;
  children: string; // HTML content for the body
  logoUrl?: string;
  storeName?: string;
  storeUrl?: string;
  designColors?: DesignColors;
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

/**
 * Extract colors from design schema JSON
 * Supports OKLCH, HSL, RGB, hex, and other color formats
 */
export function extractColorsFromSchema(schema: any): DesignColors {
  const root = schema?.[":root"] || {};

  const getColor = (varName: string): string => {
    const value = root[varName];
    return value ? colorToHex(value) : "#000000";
  };

  return {
    primary: getColor("--primary"),
    primaryForeground: getColor("--primary-foreground"),
    background: getColor("--background"),
    foreground: getColor("--foreground"),
    card: getColor("--card"),
    cardForeground: getColor("--card-foreground"),
    muted: getColor("--muted"),
    mutedForeground: getColor("--muted-foreground"),
    border: getColor("--border"),
    accent: getColor("--accent"),
    accentForeground: getColor("--accent-foreground"),
  };
}

const Header = (
  logoUrl?: string,
  storeName?: string,
  colors?: DesignColors
) => {
  const c = colors || DEFAULT_EMAIL_COLORS;
  return `
    <!--[if mso]>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:0;">
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
      <tr>
        <td align="center" style="padding:32px 24px; background-color:${
          c.card
        }; border-bottom:1px solid ${c.border};">
          ${
            logoUrl
              ? `<img src="${logoUrl}" alt="${
                  storeName || "Store"
                }" width="140" height="auto" style="display:block; margin:0 auto; max-width:100%; height:auto;" />`
              : `<div style="font-size:24px; font-weight:700; color:${
                  c.foreground
                }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${
                  storeName || "Store"
                }</div>`
          }
        </td>
      </tr>
    </table>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  `;
};

const Footer = (
  storeName?: string,
  storeUrl?: string,
  colors?: DesignColors
) => {
  const c = colors || DEFAULT_EMAIL_COLORS;
  const year = new Date().getFullYear();
  return `
    <!--[if mso]>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:0;">
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
      <tr>
        <td style="padding:32px 24px; background-color:${
          c.muted
        }; border-top:1px solid ${c.border}; text-align:center;">
          <p style="margin:0 0 8px; font-size:14px; line-height:20px; color:${
            c.mutedForeground
          }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            &copy; ${year} ${storeName || "Our Store"}. All rights reserved.
          </p>
          ${
            storeUrl
              ? `
          <p style="margin:8px 0 0; font-size:14px; line-height:20px;">
            <a href="${storeUrl}" style="color:${c.primary}; text-decoration:none; font-weight:500; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Visit our website</a>
          </p>
          `
              : ""
          }
        </td>
      </tr>
    </table>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  `;
};

export const Layout = ({
  subject,
  children,
  logoUrl,
  storeName,
  storeUrl,
  designColors,
}: EmailLayoutProps): TemplateResult => {
  const c = designColors || DEFAULT_EMAIL_COLORS;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    table, td, div, h1, h2, h3, h4, h5, h6, p { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    
    /* Responsive */
    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding: 16px !important; }
      .mobile-text-center { text-align: center !important; }
      .mobile-font-size-14 { font-size: 14px !important; }
      .mobile-font-size-16 { font-size: 16px !important; }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .dark-mode-bg { background-color: ${c.card} !important; }
      .dark-mode-text { color: ${c.foreground} !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${
    c.muted
  }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">
  <!-- Preview text -->
  <div style="display:none; font-size:1px; color:${
    c.muted
  }; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    ${subject}
  </div>
  
  <!-- Email wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; padding:0; background-color:${
    c.muted
  };">
    <tr>
      <td align="center" style="padding:24px 16px;">
        
        <!-- Main container -->
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;">
          <tr>
            <td style="padding:0;">
        <![endif]-->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto; background-color:${
          c.background
        }; border-radius:8px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          ${Header(logoUrl, storeName, c)}
          
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding:40px 32px; background-color:${
              c.background
            };">
              <div class="dark-mode-bg dark-mode-text" style="font-size:16px; line-height:24px; color:${
                c.foreground
              }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                ${children}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          ${Footer(storeName, storeUrl, c)}
          
        </table>
        <!--[if mso]>
            </td>
          </tr>
        </table>
        <![endif]-->
        
      </td>
    </tr>
  </table>
</body>
</html>
`;
  return { subject, html };
};
