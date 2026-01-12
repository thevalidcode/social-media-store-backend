import {
  LogoVars,
  TemplateResult,
  DesignColors,
} from "../components/EmailLayout";
import {
  forgotPassword,
  passwordChanged,
  ForgotPasswordVars,
} from "./user.templates";
import {
  adminForgotPassword,
  adminPasswordChanged,
  AdminForgotPasswordVars,
} from "./admin.templates";
import {
  newOrder,
  newFailedOrder,
  NewOrderVars,
  NewFailedOrderVars,
} from "./order.templates";
import {
  newRefill,
  newFailedRefill,
  NewRefillVars,
  NewFailedRefillVars,
} from "./refill.templates";
import {
  newService,
  NewServiceVars,
} from "./service.templates";

interface StoreSettings {
  logoUrl: string;
  storeName: string;
  storeUrl: string;
  designColors?: DesignColors;
}

// Map each template type string to the specific variable type it expects
export interface EmailTemplateVars {
  FORGOT_PASSWORD: ForgotPasswordVars;
  PASSWORD_CHANGED: LogoVars;
  ADMIN_FORGOT_PASSWORD: AdminForgotPasswordVars;
  ADMIN_PASSWORD_CHANGED: LogoVars;
  NEW_ORDER: NewOrderVars;
  NEW_FAILED_ORDER: NewFailedOrderVars;
  NEW_REFILL: NewRefillVars;
  NEW_FAILED_REFILL: NewFailedRefillVars;
  NEW_SERVICE: NewServiceVars;
}

// Typed templates for dev-time safety
const typedTemplates: {
  [K in keyof EmailTemplateVars]: (
    vars: EmailTemplateVars[K],
    storeSettings: StoreSettings
  ) => TemplateResult;
} = {
  FORGOT_PASSWORD: forgotPassword,
  PASSWORD_CHANGED: passwordChanged,
  ADMIN_FORGOT_PASSWORD: adminForgotPassword,
  ADMIN_PASSWORD_CHANGED: adminPasswordChanged,
  NEW_ORDER: newOrder,
  NEW_FAILED_ORDER: newFailedOrder,
  NEW_REFILL: newRefill,
  NEW_FAILED_REFILL: newFailedRefill,
  NEW_SERVICE: newService,
};

/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - Template type as string
 * @param variables - Variables specific to that template
 * @param storeSettings - Store-specific settings (logo, name, url)
 * @returns Rendered email HTML and subject
 */
export function getTemplate<K extends keyof EmailTemplateVars>(
  type: K,
  variables: Record<string, any>,
  storeSettings: StoreSettings
): TemplateResult {
  const templateFn = typedTemplates[type as keyof typeof typedTemplates] as
    | ((
        vars: Record<string, any>,
        storeSettings: StoreSettings
      ) => TemplateResult)
    | undefined;
  if (!templateFn) {
    throw new Error(`Email template for type "${type}" not found.`);
  }

  return templateFn(variables, storeSettings);
}
