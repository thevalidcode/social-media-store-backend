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

export interface NewOrderVars {
  serviceId: number;
  quantity: number;
  url: string;
  userBalance: string | number;
}

export interface NewFailedOrderVars {
  serviceId: number;
  quantity: number;
  url: string;
  userBalance: string | number;
  providerError: string;
}

/**
 * New Order Email Template
 * Sent to user when their order is successfully placed
 */
export const newOrder = (
  { serviceId, quantity, url, userBalance }: NewOrderVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;
  const orderDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const orderTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const bodyContent = `
    <!-- Success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ Order Confirmed</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Your Order Has Been Placed!
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      Great news! Your order has been successfully submitted and is now being processed. Here are your order details:
    </p>
    
    <!-- Order Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Order Summary</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Service ID</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">#${serviceId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Quantity</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${Number(quantity).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Target URL</td>
              <td style="padding:12px 0; font-size:14px; color:${c.primary}; text-align:right; word-break:break-all;">
                <a href="${url}" style="color:${c.primary}; text-decoration:none;">${url.length > 40 ? url.substring(0, 40) + '...' : url}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Date</td>
              <td style="padding:12px 0; font-size:14px; color:${c.foreground}; text-align:right;">${orderDate}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:14px; color:${c.mutedForeground};">Remaining Balance</td>
                    <td style="font-size:18px; font-weight:700; color:${c.primary}; text-align:right;">$${Number(userBalance).toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- What's Next -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${c.muted}; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; line-height:20px; color:${c.foreground};">
            📦 What's Next?
          </p>
          <ul style="margin:0; padding-left:20px; font-size:13px; line-height:22px; color:${c.mutedForeground};">
            <li>Your order is being processed by our system</li>
            <li>Delivery typically starts within minutes</li>
            <li>Track your order progress in your dashboard</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${storeSettings.storeUrl}/orders" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            View Order Status
          </a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Order Confirmed - Service #${serviceId}`,
    children: bodyContent,
    logoUrl: storeSettings.logoUrl,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};

/**
 * Failed Order Email Template
 * Sent to user when their order fails
 */
export const newFailedOrder = (
  { serviceId, quantity, url, userBalance, providerError }: NewFailedOrderVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;

  const bodyContent = `
    <!-- Error badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#EF4444; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✕ Order Failed</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${c.foreground}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      Order Could Not Be Processed
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${c.foreground};">
      We're sorry, but there was an issue processing your order. Your balance has been refunded automatically.
    </p>
    
    <!-- Error Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:#FEF2F2; border:1px solid #FECACA;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px; font-size:14px; font-weight:600; color:#DC2626;">
            ⚠️ Error Details
          </p>
          <p style="margin:0; font-size:14px; line-height:20px; color:#7F1D1D; font-family:monospace; background-color:#FEE2E2; padding:12px; border-radius:4px;">
            ${providerError}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Order Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${c.card}; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${c.border};">
                <p style="margin:0; font-size:14px; font-weight:600; color:${c.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Failed Order Details</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Service ID</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">#${serviceId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Quantity</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${c.foreground}; text-align:right;">${Number(quantity).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${c.mutedForeground};">Target URL</td>
              <td style="padding:12px 0; font-size:14px; color:${c.primary}; text-align:right; word-break:break-all;">
                ${url.length > 40 ? url.substring(0, 40) + '...' : url}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid ${c.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:14px; color:${c.mutedForeground};">Refunded Balance</td>
                    <td style="font-size:18px; font-weight:700; color:#10B981; text-align:right;">$${Number(userBalance).toFixed(2)}</td>
                  </tr>
                </table>
              </td>
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
            <li>Verify that the URL is correct and publicly accessible</li>
            <li>Try placing the order again</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${c.primary};">
          <a href="${storeSettings.storeUrl}/new" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${c.primaryForeground}; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Try Again
          </a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Order Failed - Service #${serviceId}`,
    children: bodyContent,
    logoUrl: storeSettings.logoUrl,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};
