"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newFailedRefill = exports.newRefill = void 0;
const newRefill = ({ id, username, logo, provider, order_id, price, number, }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Refill Request</title>
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
`;
exports.newRefill = newRefill;
const newFailedRefill = ({ id, username, logo, provider, order_id, price, number, error, }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refill Failed Notification</title>
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
        <p>A recent refill on your panel didn't go through. Here are the details:</p>
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
`;
exports.newFailedRefill = newFailedRefill;
