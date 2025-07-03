interface NewSupportVars {
  id: number | string;
  subject: string;
  user: string;
  message: string;
  logo: string;
}

interface NewMessageVars {
  ticket_id: string | number;
  user: string;
  content: string;
  logo: string;
}

const newSupport = ({
  id,
  subject,
  user,
  message,
  logo,
}: NewSupportVars): string => `
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
`;

const newMessage = ({
  ticket_id,
  user,
  content,
  logo,
}: NewMessageVars): string => `
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
  </html>
`;

export { newSupport, newMessage };
