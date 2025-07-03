"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundsAdded = exports.newUser = exports.verificationCode = void 0;
const verificationCode = ({ username, verification_code, company, logo, }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>...</head>
  <body>...</body>
  </html>
`;
exports.verificationCode = verificationCode;
const newUser = ({ username, email, id, logo }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>...</head>
  <body>...</body>
  </html>
`;
exports.newUser = newUser;
const fundsAdded = ({ username, amount, currency, method, logo, }) => `
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
`;
exports.fundsAdded = fundsAdded;
