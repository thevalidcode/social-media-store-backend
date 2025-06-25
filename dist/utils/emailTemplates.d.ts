type TemplateVariables = Record<string, any>;
/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - The identifier for the template (e.g., 'welcome', 'resetPassword')
 * @param variables - A key-value map of variables to be injected into the template
 * @returns A rendered email template string
 * @throws If the template type is not found
 */
declare function getTemplate(type: string, variables: TemplateVariables): string;
export { getTemplate };
