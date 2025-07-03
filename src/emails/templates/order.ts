interface NewOrderVars {
  username: string;
  id: number | string;
  url: string;
  number: number;
  price: number;
  user_balance: number;
  service_id: number | string;
  provider: string;
  logo: string;
}

interface FailedOrderVars extends NewOrderVars {
  provider_error: string;
}

export const newOrder = ({
  username,
  id,
  url,
  number,
  price,
  user_balance,
  service_id,
  provider,
  logo,
}: NewOrderVars): string => `
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
  `;
export const newFailedOrder = ({
  username,
  id,
  logo,
  url,
  number,
  user_balance,
  service_id,
  price,
  provider,
  provider_error,
}: FailedOrderVars): string => `
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
  `;
