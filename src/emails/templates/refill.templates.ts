import {
  Layout,
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

export interface NewRefillVars {
  orderId: number;
  number: number;
  price: string | number;
  provider: string;
}

export interface NewFailedRefillVars {
  orderId: number;
  quantity: number;
  price: string | number;
  provider: string;
  error: string;
}

/**
 * New Refill Email Template
 * Sent to user when their refill request is successful
 */
export const newRefill = (
  { orderId, number, price, provider }: NewRefillVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;
  const refillDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bodyContent = `
    <!-- Success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Refill Submitted</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Refill Request Confirmed
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Your refill request has been successfully submitted and is being processed. Here are the details:
    </p>
    
    <!-- Refill Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Refill Details</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Order ID</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Quantity</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${Number(number).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Date</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${refillDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Info box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            🔄 About Refills
          </p>
          <p style="margin:0; font-size:13px; line-height:20px; color:${c.mutedForeground};">
            Refills are processed automatically by our system. The processing time may vary depending on the service. You can track the status of your refill in your dashboard.
          </p>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${storeSettings.storeUrl}/refills" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View Refill Status
          </a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Refill Confirmed - Order #${orderId}`,
    children: bodyContent,
    logoUrl: storeSettings.logoUrl,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};

/**
 * Failed Refill Email Template
 * Sent to user when their refill request fails
 */
export const newFailedRefill = (
  { orderId, quantity, price, provider, error }: NewFailedRefillVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Error badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#EF4444; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✕ Refill Failed</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Refill Request Failed
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We're sorry, but your refill request could not be processed. Here are the details:
    </p>
    
    <!-- Error Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:#FEF2F2; border:1px solid #FECACA;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; color:#DC2626;">
            ⚠️ Error Details
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:#7F1D1D; font-family:monospace; background-color:#FEE2E2; padding:12px; border-radius:4px;">
            ${error}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Refill Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Failed Refill Details</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Order ID</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Quantity</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${Number(quantity).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Original Price</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">$${Number(price).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- What to do -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            💡 What You Can Do
          </p>
          <ul style="margin:0; padding-left:20px; font-size:13px; line-height:22px; color:${c.mutedForeground};">
            <li>Check if your original order is eligible for refill</li>
            <li>Ensure the order has been completed</li>
            <li>Try submitting the refill request again</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${storeSettings.storeUrl}/support" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Contact Support
          </a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Refill Failed - Order #${orderId}`,
    children: bodyContent,
    logoUrl: storeSettings.logoUrl,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};
