interface NewServiceVars {
  id: number | string;
  name: string;
  type: string;
  category: string;
  min: number;
  max: number;
  providerPrice: number;
  providerCurrency: string;
  price: number;
  provider: string;
  logo: string;
}

const newService = ({
  id,
  name,
  type,
  category,
  min,
  max,
  providerPrice,
  providerCurrency,
  price,
  provider,
  logo,
}: NewServiceVars): string => `
  <!DOCTYPE html>
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
          <p><strong>Provider Price:</strong> ${providerPrice} ${providerCurrency}</p>
          <p><strong>Price:</strong> $${price}</p>
          <p><strong>Provider:</strong> ${provider}</p>
        </div>
        <p>Please review the service in the admin store.</p>
        <p>Thank you!</p>
      </div>
    </div>
  </body>
  </html>
`;

export { newService };
