import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

interface StoreSettings {
  logoUrl: string;
  storeName: string;
  storeUrl: string;
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
  const resetLink = `${storeSettings.storeUrl}/auth/reset-password?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;

  const bodyContent = `
    <p style="font-size:16px; margin-bottom:20px;">Hello,</p>
    <p style="font-size:16px; margin-bottom:20px;">
      We received a request to reset your password for your ${storeSettings.storeName} account. Click the button below to set a new password.
    </p>
    <p style="text-align:center; margin-bottom:30px;">
      <a href="${resetLink}" style="
        background:#7C3AED;
        color:#fff;
        text-decoration:none;
        padding:12px 25px;
        border-radius:6px;
        font-weight:bold;
        display:inline-block;
      ">Reset Password</a>
    </p>
    <p style="font-size:14px; color:#666;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
    <p style="font-size:12px; color:#999; margin-top:20px;">
      This link will expire in 1 hour for security reasons.
    </p>
  `;

  return Layout({
    subject: "Reset Your Password",
    children: bodyContent,
    logoUrl: storeSettings.logoUrl || logo,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
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
  const bodyContent = `
    <p style="font-size:16px; margin-bottom:20px;">Hello,</p>

    <p style="font-size:16px; margin-bottom:20px;">
      Your password for your ${storeSettings.storeName} account has been successfully changed. If you initiated this change, no further action is needed.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#EDE9FE; padding:15px; border-radius:8px; text-align:center;">
          <span style="color:#7C3AED; font-weight:bold; font-size:16px;">Password Changed Successfully</span>
        </td>
      </tr>
    </table>

    <p style="font-size:14px; color:#666;">
      If you did NOT change your password, please <a href="${storeSettings.storeUrl}/contact" style="color:#7C3AED; text-decoration:none;">contact support immediately</a> to secure your account.
    </p>
  `;

  return Layout({
    subject: "Your Password Has Been Changed",
    children: bodyContent,
    logoUrl: storeSettings.logoUrl || logo,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
  });
};
