import {
  Layout,
  LogoVars,
  TemplateResult,
  DesignColors,
} from "../components/EmailLayout";
import { DEFAULT_EMAIL_COLORS } from "../constants/defaultColors";

interface StoreSettings {
  logoUrl: string;
  storeName: string;
  storeUrl: string;
  designColors?: DesignColors;
}

export interface ForgotPasswordVars {
  email: string;
  token: string;
  logo: string;
  storeName: string;
  storeUrl: string;
}

/**
 * User Forgot Password Email Template
 * Reset link points to /reset-password
 */
export const forgotPassword = (
  { email, token, logo }: ForgotPasswordVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const resetLink = `${
    storeSettings.storeUrl
  }/auth/reset-password?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;

  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Reset Your Password
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hello,
    </p>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We received a request to reset your password for your ${storeSettings.storeName} account. Click the button below to set a new password.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${resetLink}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Info box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            <strong style="display:block; margin-bottom:4px; color:${c.foreground};">Security Notice</strong>
            This link will expire in <strong>1 hour</strong> for security reasons. If you didn't request this password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Alternative link -->
    <p style="margin:0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:8px 0 0; font-size:14px; line-height:20px; word-break:break-all;">
      <a href="${resetLink}" style="color:${c.primary}; text-decoration:underline;">${resetLink}</a>
    </p>
  `;

  return Layout({
    subject: "Reset Your Password",
    children: bodyContent,
    logoUrl: storeSettings.logoUrl || logo,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};

/**
 * User Password Changed Email Template
 * Confirmation email sent after successful password change
 */
export const passwordChanged = (
  { logo }: LogoVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${
      c.foreground
    }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Password Changed Successfully
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${
      c.foreground
    };">
      Hello,
    </p>

    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${
      c.foreground
    };">
      Your password for your ${
        storeSettings.storeName
      } account has been successfully changed. If you initiated this change, no further action is needed.
    </p>

    <!-- Success indicator -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${
      c.accent
    }; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px 24px; text-align:center;">
          <div style="display:inline-block; width:48px; height:48px; border-radius:50%; background-color:${
            c.primary
          }; margin-bottom:12px;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <path d="M20 24.5L22.5 27L28 21.5" stroke="${
                c.primaryForeground
              }" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p style="margin:0; font-size:16px; font-weight:600; line-height:24px; color:${
            c.foreground
          };">
            Your password has been updated
          </p>
          <p style="margin:8px 0 0; font-size:14px; line-height:20px; color:${
            c.mutedForeground
          };">
            ${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </td>
      </tr>
    </table>

    <!-- Security alert -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${
      c.muted
    }; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${
            c.foreground
          };">
            <strong style="display:block; margin-bottom:4px;">Didn't make this change?</strong>
            <span style="color:${
              c.mutedForeground
            };">If you did NOT change your password, please </span>
            <a href="${storeSettings.storeUrl}/contact" style="color:${
    c.primary
  }; text-decoration:none; font-weight:600;">contact support immediately</a>
            <span style="color:${
              c.mutedForeground
            };"> to secure your account.</span>
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Best practices tip -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${
      c.accent
    }; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${
            c.foreground
          };">
            Security Tips
          </p>
          <ul style="margin:0; padding-left:20px; font-size:13px; line-height:20px; color:${
            c.mutedForeground
          };">
            <li style="margin-bottom:4px;">Use a strong, unique password for your account</li>
            <li style="margin-bottom:4px;">Never share your password with anyone</li>
            <li>Enable two-factor authentication for extra security</li>
          </ul>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "Your Password Has Been Changed",
    children: bodyContent,
    logoUrl: storeSettings.logoUrl || logo,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};
