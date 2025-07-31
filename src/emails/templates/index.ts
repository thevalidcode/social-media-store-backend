import { newFailedOrder, newOrder } from "./order.templates";
import { newFailedRefill, newRefill } from "./refill.templates";
import { newService } from "./service.templates";
import { newMessage, newSupport } from "./support.templates";
import { fundsAdded, newUser, verificationCode } from "./user.templates";

interface EmailTemplates {
  [key: string]: ((v: any) => string) | undefined;
}

// Templates object
const templates: EmailTemplates = {
  verificationCode,
  newUser,
  newOrder,
  newFailedOrder,
  newRefill,
  newFailedRefill,
  newService,
  newSupport,
  newMessage,
  fundsAdded,
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
