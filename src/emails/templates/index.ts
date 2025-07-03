import { newFailedOrder, newOrder } from "./order";
import { newFailedRefill, newRefill } from "./refill";
import { newService } from "./service";
import { newMessage, newSupport } from "./support";
import { fundsAdded, newUser, verificationCode } from "./user";

interface EmailTemplates {
  [key: string]: ((v: any) => string) | undefined;
}

// Templates object
const templates: EmailTemplates = {
  verification_code: verificationCode,
  new_user: newUser,
  new_order: newOrder,
  new_failed_order: newFailedOrder,
  new_refill: newRefill,
  new_failed_refill: newFailedRefill,
  new_service: newService,
  new_support: newSupport,
  new_message: newMessage,
  funds_added: fundsAdded,
};

type TemplateVariables = Record<string, any>;

/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - The identifier for the template (e.g., 'welcome', 'resetPassword')
 * @param variables - A key-value map of variables to be injected into the template
 * @returns A rendered email template string
 * @throws If the template type is not found
 */
function getTemplate(type: string, variables: TemplateVariables): string {
  const templateFn = templates[type];

  if (!templateFn) {
    throw new Error(`Email template for type "${type}" not found.`);
  }

  return templateFn(variables);
}

export { getTemplate };
