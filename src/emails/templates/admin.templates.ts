import { Layout, LogoVars, TemplateResult, DesignColors } from "../components/EmailLayout";
import { DEFAULT_EMAIL_COLORS } from "../constants/defaultColors";

interface StoreSettings {
  logoUrl: string;
  storeName: string;
  storeUrl: string;
  designColors?: DesignColors;
}

export interface AdminForgotPasswordVars {
  email: string;
  token: string;
  logo: string;
  storeName: string;
  storeUrl: string;
}

/**
 * Admin Forgot Password Email Template
 * Reset link points to /admin/reset-password
 */
export const adminForgotPassword = (
  { email, token, logo }: AdminForgotPasswordVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const resetLink = `${storeSettings.storeUrl}/admin/auth/reset-password?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;
  
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Admin badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:6px 12px; background-color:${c.primary}; border-radius:4px;">
          <span style="font-size:12px; font-weight:600; line-height:16px; color:${c.primaryForeground}; text-transform:uppercase; letter-spacing:0.5px;">Admin Access</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Reset Your Admin Password
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hello Admin,
    </p>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We received a request to reset your admin password for <strong>${storeSettings.storeName}</strong>. Click the button below to set a new password.
    </p>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${resetLink}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Reset Admin Password
          </a>
        </td>
      </tr>
    </table>
    
    <!-- Admin-specific security notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${c.foreground};">
            <strong style="display:block; margin-bottom:4px;">⚠️ Admin Account Security</strong>
            <span style="color:${c.mutedForeground};">This link will expire in <strong>24 hours</strong>. As an admin, please ensure you're accessing this from a secure device. If you didn't request this reset, contact your system administrator immediately.</span>
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
    subject: "Reset Your Admin Password - Action Required",
    children: bodyContent,
    logoUrl: storeSettings.logoUrl || logo,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};

/**
 * Admin Password Changed Email Template
 * Confirmation email sent after successful password change
 */
export const adminPasswordChanged = (
  { logo }: LogoVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;
  
  const bodyContent = `
    <!-- Admin badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:6px 12px; background-color:${c.primary}; border-radius:4px;">
          <span style="font-size:12px; font-weight:600; line-height:16px; color:${c.primaryForeground}; text-transform:uppercase; letter-spacing:0.5px;">Admin Account</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Admin Password Changed
    </h1>
    
    <p style="margin:0 0 16px; font-size:16px; line-height:24px; color:${c.foreground};">
      Hello Admin,
    </p>

    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Your admin password for <strong>${storeSettings.storeName}</strong> has been successfully changed. If you initiated this change, no further action is needed.
    </p>

    <!-- Success indicator -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:20px 24px; text-align:center;">
          <div style="display:inline-block; width:48px; height:48px; border-radius:50%; background-color:${c.primary}; margin-bottom:12px;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <path d="M20 24.5L22.5 27L28 21.5" stroke="${c.primaryForeground}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p style="margin:0; font-size:16px; font-weight:600; line-height:24px; color:${c.foreground};">
            Admin password updated successfully
          </p>
          <p style="margin:8px 0 0; font-size:14px; line-height:20px; color:${c.mutedForeground};">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </td>
      </tr>
    </table>

    <!-- Critical security alert for admin -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:#FEF2F2; border-left:4px solid #EF4444;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:#0f172a;">
            <strong style="display:block; margin-bottom:4px; color:#DC2626;">⚠️ Unauthorized Access?</strong>
            <span style="color:#64748b;">If you did NOT make this change, your admin account may be compromised. Please </span>
            <a href="${storeSettings.storeUrl}/admin/contact" style="color:#EF4444; text-decoration:none; font-weight:600;">contact support immediately</a>
            <span style="color:#64748b;"> and review your account activity.</span>
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Admin account details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 12px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            Recent Activity Summary
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px; line-height:20px; color:${c.mutedForeground};">
            <tr>
              <td style="padding:4px 0;"><strong>Action:</strong></td>
              <td style="padding:4px 0; text-align:right;">Password Changed</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Date:</strong></td>
              <td style="padding:4px 0; text-align:right;">${new Date().toLocaleDateString('en-US')}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Time:</strong></td>
              <td style="padding:4px 0; text-align:right;">${new Date().toLocaleTimeString('en-US')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Admin security best practices -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; border-radius:6px; background-color:${c.accent}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            🔒 Admin Security Best Practices
          </p>
          <ul style="margin:0; padding-left:20px; font-size:13px; line-height:20px; color:${c.mutedForeground};">
            <li style="margin-bottom:4px;">Use a strong, unique password (minimum 16 characters)</li>
            <li style="margin-bottom:4px;">Never share your admin credentials with anyone</li>
            <li style="margin-bottom:4px;">Enable two-factor authentication (2FA)</li>
            <li style="margin-bottom:4px;">Only access admin panel from secure, trusted devices</li>
            <li>Regularly review account activity and access logs</li>
          </ul>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "Admin Password Changed - Security Notification",
    children: bodyContent,
    logoUrl: storeSettings.logoUrl || logo,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};
