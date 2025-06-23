"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = getTemplate;
// Templates object
const templates = {
    verification_code: ({ username, verification_code, company, logo }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .verification-code {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          letter-spacing: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Password Reset Request</h1>
          <p>Hi ${username},</p>
          <p>We received a request to reset the password for your account. Please use the verification code below to complete the process:</p>
          <div class="verification-code">${verification_code}</div>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Thank you!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${company}. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `,
    new_user: ({ username, email, id, logo }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New User Registered</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A new user has registered on your site. Here are the details:</p>
          <div class="details">
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          <p>Please review the user's details in the admin panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  `,
    new_order: ({ username, id, url, number, price, user_balance, service_id, provider, logo, }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .order-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A new order has been placed on your site. Here are the details:</p>
          <div class="order-details">
            <p><strong>Order ID:</strong> ${id}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Order URL:</strong> ${url}</p>
            <p><strong>Quantity:</strong> ${number}</p>
            <p><strong>Total Price:</strong> $${price}</p>
            <p><strong>User Balance After Purchase:</strong> $${user_balance}</p>
            <p><strong>Service ID:</strong> ${service_id}</p>
            <p><strong>Provider:</strong> ${provider}</p>
          </div>
          <p>Please process this order through the admin panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  `,
    new_refill: ({ id, username, logo, provider, order_id, price, number }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .order-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A new refill has been requested on your site. Here are the details:</p>
          <div class="order-details">
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Quantity:</strong> ${number}</p>
            <p><strong>Total Price:</strong> $${price}</p>
            <p><strong>Provider:</strong> ${provider}</p>
          </div>
          <p>Please process this refill through the admin or provider panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  `,
    new_failed_refill: ({ id, username, logo, provider, order_id, price, number, error, }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .order-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A recent refill on your panel didn't go through... Here are the details:</p>
          <div class="order-details">
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Quantity:</strong> ${number}</p>
            <p><strong>Total Price:</strong> $${price}</p>
            <p><strong>Provider:</strong> ${provider}</p>
            <p><strong>Error:</strong> ${error}</p>
          </div>
          <p>Please fix this refill through the admin or provider panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  `,
    new_failed_order: ({ username, id, logo, url, number, user_balance, service_id, price, provider, provider_error, }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .order-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A recent order on your panel didn't go through. Here are the details:</p>
          <div class="order-details">
            <p><strong>Order ID:</strong> ${id}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Order URL:</strong> ${url}</p>
            <p><strong>Quantity:</strong> ${number}</p>
            <p><strong>Total Price:</strong> $${price}</p>
            <p><strong>User Balance After Purchase:</strong> $${user_balance}</p>
            <p><strong>Service ID:</strong> ${service_id}</p>
            <p><strong>Provider:</strong> ${provider}</p>
            <p><strong>Provider Error:</strong> ${provider_error}</p>
          </div>
          <p>Please fix this order through the admin or provider's panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  `,
    new_service: ({ id, name, type, category, min, max, provider_price, provider_currency, price, provider, logo, }) => `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Service Added</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .service-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A new service has been added to your site. Here are the details:</p>
          <div class="service-details">
            <p><strong>Service ID:</strong> ${id}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Min:</strong> ${min}</p>
            <p><strong>Max:</strong> ${max}</p>
            <p><strong>Provider Price:</strong> ${provider_price} ${provider_currency}</p>
            <p><strong>Price:</strong> $${price}</p>
            <p><strong>Provider:</strong> ${provider}</p>
          </div>
          <p>Please review the service in the admin panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>`,
    new_support: ({ id, subject, user, message, logo }) => `
    
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Support Ticket Submitted</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .ticket-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A new support ticket has been submitted. Here are the details:</p>
          <div class="ticket-details">
            <p><strong>Ticket ID:</strong> ${id}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Submitted by:</strong> ${user}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          <p>Please review and respond to the ticket in the admin panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  
 `,
    new_message: ({ ticket_id, user, content, logo }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Message on Support Ticket</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .message-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>A new message has been received on a support ticket. Here are the details:</p>
          <div class="message-details">
            <p><strong>Ticket ID:</strong> ${ticket_id}</p>
            <p><strong>Message:</strong> ${content}</p>
            <p><strong>Received from:</strong> ${user}</p>
          </div>
          <p>Please log in to the admin panel to review and respond to the message.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>`,
    funds_added: ({ username, amount, currency, method, logo }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Funds Added to Account</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .funds-details {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Dear Admin,</h1>
          <p>Funds have been added to a user's account. Here are the details:</p>
          <div class="funds-details">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Method:</strong> ${method}</p>
            <p><strong>User Currency:</strong> ${currency}</p>
          </div>
          <p>Please verify the transaction in the admin panel.</p>
          <p>Thank you!</p>
        </div>
      </div>
    </body>
    </html>
  `,
};
/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - The identifier for the template (e.g., 'welcome', 'resetPassword')
 * @param variables - A key-value map of variables to be injected into the template
 * @returns A rendered email template string
 * @throws If the template type is not found
 */
function getTemplate(type, variables) {
    const templateFn = templates[type];
    if (!templateFn) {
        throw new Error(`Email template for type "${type}" not found.`);
    }
    return templateFn(variables);
}
