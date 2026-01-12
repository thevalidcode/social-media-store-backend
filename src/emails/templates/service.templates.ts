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

export interface NewServiceVars {
  name: string;
  category: string;
  storeScopedId: number;
  price: string | number;
  providerPrice: string | number;
  providerCurrency: string;
  min: number;
  max: number;
  type: string;
}

/**
 * New Service Email Template (Admin)
 * Sent to admins when a new service is synced from provider
 */
export const newService = (
  {
    name,
    category,
    storeScopedId,
    price,
    providerPrice,
    providerCurrency,
    min,
    max,
    type,
  }: NewServiceVars,
  storeSettings: StoreSettings
): TemplateResult => {
  const c = storeSettings.designColors || DEFAULT_EMAIL_COLORS;
  const syncDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const syncTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const profit = (Number(price) - Number(providerPrice)).toFixed(2);
  const profitMargin =
    Number(providerPrice) > 0
      ? (
          ((Number(price) - Number(providerPrice)) / Number(providerPrice)) *
          100
        ).toFixed(1)
      : "0";

  const bodyContent = `
    <!-- Admin badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td style="display:inline-block; padding:6px 12px; background-color:${
          c.primary
        }; border-radius:4px;">
          <span style="font-size:12px; font-weight:600; line-height:16px; color:${
            c.primaryForeground
          }; text-transform:uppercase; letter-spacing:0.5px;">Admin Notification</span>
        </td>
      </tr>
    </table>
    
    <!-- New service badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
      <tr>
        <td style="display:inline-block; padding:8px 16px; background-color:#10B981; border-radius:20px;">
          <span style="font-size:13px; font-weight:600; line-height:16px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">✓ New Service Added</span>
        </td>
      </tr>
    </table>
    
    <h1 style="margin:0 0 24px; font-size:28px; font-weight:700; line-height:34px; color:${
      c.foreground
    }; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      New Service Synced
    </h1>
    
    <p style="margin:0 0 24px; font-size:16px; line-height:24px; color:${
      c.foreground
    };">
      A new service has been automatically synced from your provider and is now available in your store.
    </p>
    
    <!-- Service Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${
      c.card
    }; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${
                c.border
              };">
                <p style="margin:0; font-size:14px; font-weight:600; color:${
                  c.mutedForeground
                }; text-transform:uppercase; letter-spacing:0.5px;">Service Information</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Service ID</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${
                c.foreground
              }; text-align:right;">#${storeScopedId}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Name</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${
                c.foreground
              }; text-align:right; max-width:200px; word-wrap:break-word;">${
    name.length > 50 ? name.substring(0, 50) + "..." : name
  }</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Category</td>
              <td style="padding:12px 0; font-size:14px; color:${
                c.foreground
              }; text-align:right;">${category}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Type</td>
              <td style="padding:12px 0; font-size:14px; color:${
                c.foreground
              }; text-align:right;">
                <span style="display:inline-block; padding:4px 8px; background-color:${
                  c.muted
                }; border-radius:4px; font-size:12px; font-weight:500;">${type}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Min / Max</td>
              <td style="padding:12px 0; font-size:14px; color:${
                c.foreground
              }; text-align:right;">${Number(min).toLocaleString()} - ${Number(
    max
  ).toLocaleString()}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Pricing Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:8px; background-color:${
      c.accent
    }; border:1px solid ${c.border};">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td colspan="2" style="padding-bottom:16px; border-bottom:1px solid ${
                c.border
              };">
                <p style="margin:0; font-size:14px; font-weight:600; color:${
                  c.foreground
                }; text-transform:uppercase; letter-spacing:0.5px;">💰 Pricing Details</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Provider Cost (per 1K)</td>
              <td style="padding:12px 0; font-size:14px; font-weight:600; color:${
                c.foreground
              }; text-align:right;">$${Number(providerPrice).toFixed(
    4
  )} ${providerCurrency}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-size:14px; color:${
                c.mutedForeground
              };">Your Price (per 1K)</td>
              <td style="padding:12px 0; font-size:18px; font-weight:700; color:${
                c.primary
              }; text-align:right;">$${Number(price).toFixed(4)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid ${
                c.border
              };">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:14px; color:${
                      c.mutedForeground
                    };">Profit Margin</td>
                    <td style="font-size:16px; font-weight:700; color:#10B981; text-align:right;">+$${profit} (${profitMargin}%)</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Sync info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; border-radius:6px; background-color:${
      c.muted
    }; border-left:4px solid ${c.primary};">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; font-size:14px; line-height:20px; color:${
            c.foreground
          };">
            <strong>Synced on:</strong> ${syncDate} at ${syncTime}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
      <tr>
        <td align="center" style="border-radius:6px; background-color:${
          c.primary
        };">
          <a href="${
            storeSettings.storeUrl
          }/admin/services" target="_blank" style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; line-height:20px; color:${
    c.primaryForeground
  }; text-decoration:none; border-radius:6px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            Manage Services
          </a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `New Service Added: ${name.substring(0, 30)}${
      name.length > 30 ? "..." : ""
    }`,
    children: bodyContent,
    logoUrl: storeSettings.logoUrl,
    storeName: storeSettings.storeName,
    storeUrl: storeSettings.storeUrl,
    designColors: c,
  });
};
