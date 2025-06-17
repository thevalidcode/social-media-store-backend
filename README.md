# ✨ Social Media Store Backend ✨

A powerful and flexible backend for managing your social media marketing stores. Built with Express.js, PostgreSQL, and a suite of modern tools, this backend provides a robust foundation for your SMM platform.

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 🛠️ Installation

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/thevalidcode/social-media-store-backend.git
    cd social-media-store-backend
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:

    *   Create a `.env` file in the root directory.
    *   Add the necessary environment variables (see `.env.example`):

    ```bash
    NODE_ENV=development
    PORT=4001
    SESSION_SECRET=your_secret_session_key
    DB_HOST=localhost
    DB_PORT=5432
    VSP_DB_NAME=vsp_database_name
    VSP_DB_USER=vsp_database_user
    VP_DB_NAME=vp_database_name
    VP_DB_USER=vp_database_user
    DB_PASSWORD=your_db_password
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=admin_password
    RATE_KEY=your_rate_api_key
    MASTER_KEY=your_master_encryption_key_32_chars
    ```

4.  **Database Setup**:

    *   Ensure you have PostgreSQL installed and running.
    *   Create the necessary databases (`vsp_database_name` and `vp_database_name`).
    *   Configure the database connection in `db.js` with your credentials.

5.  **Start the Application**:

    ```bash
    npm start
    ```

### ⚙️ Environment Variables

| Variable          | Description                                                                    | Example                                   |
| :---------------- | :----------------------------------------------------------------------------- | :---------------------------------------- |
| `NODE_ENV`        | Environment mode (development or production)                                   | `development`                             |
| `PORT`            | Port number the server will listen on                                         | `4001`                                    |
| `SESSION_SECRET`  | Secret key for session management                                            | `your_secret_session_key`                 |
| `DB_HOST`         | Database host address                                                          | `localhost`                               |
| `DB_PORT`         | Database port number                                                           | `5432`                                    |
| `VSP_DB_NAME`     | Name of the Valid SMM Panel database                                           | `vsp_database_name`                       |
| `VSP_DB_USER`     | Username for the Valid SMM Panel database                                      | `vsp_database_user`                       |
| `VP_DB_NAME`      | Name of the Valid Panel database                                             | `vp_database_name`                        |
| `VP_DB_USER`      | Username for the Valid Panel database                                        | `vp_database_user`                        |
| `DB_PASSWORD`     | Password for the database user                                               | `your_db_password`                        |
| `ADMIN_USERNAME`  | Default admin username                                                         | `admin`                                   |
| `ADMIN_PASSWORD`  | Default admin password                                                         | `admin_password`                          |
| `RATE_KEY`        | API key for fetching exchange rates                                            | `your_rate_api_key`                       |
| `MASTER_KEY`      | Master encryption key (must be 32 characters)                                | `your_master_encryption_key_32_chars`      |

## 💻 Usage

### API Documentation

The API documentation is generated using Swagger. To access it:

1.  Log in as an admin by visiting `/admin/login`.
2.  Enter your admin username and password (defined in your `.env` file).
3.  You will be redirected to the Swagger UI at `/admin/docs`.

### Example Endpoints

<details>
<summary><strong>Get Services (Example)</strong></summary>

1.  Send a `POST` request to `/api/v2` with the following JSON payload:

    ```json
    {
      "key": "your_api_key",
      "action": "services"
    }
    ```

2.  The server will respond with a JSON array containing the available services:

    ```json
    [
      {
        "service": 1,
        "name": "TikTok Views",
        "type": "Default",
        "category": "TikTok",
        "rate": "0.001",
        "min": "100",
        "max": "1000000"
      }
    ]
    ```
</details>

## ✨ Features

*   **Express.js Framework**: Robust and scalable server-side logic.
*   **PostgreSQL Database**: Reliable and efficient data storage.
*   **Swagger API Documentation**: Auto-generated and interactive API documentation.
*   **User Authentication**: Secure admin and user authentication.
*   **Real-time Updates**: Socket.io integration for real-time updates.
*   **Cron Jobs**: Automated tasks for order syncing and data updates.
*   **Payment Gateway Integration**: Handles payment processing with Flutterwave and Paystack.

## 🛠️ Technologies Used

| Technology        | Description                               |                                                                                                       |
| :---------------- | :---------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| Express.js        | Backend framework                         | [https://expressjs.com/](https://expressjs.com/)                                                     |
| PostgreSQL        | Database                                  | [https://www.postgresql.org/](https://www.postgresql.org/)                                           |
| Node.js           | Runtime environment                       | [https://nodejs.org/](https://nodejs.org/)                                                             |
| Socket.io         | Real-time communication                   | [https://socket.io/](https://socket.io/)                                                             |
| Swagger           | API documentation                         | [https://swagger.io/](https://swagger.io/)                                                             |
| bcrypt            | Password hashing                          | [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)                           |
| node-cron         | Task scheduling                           | [https://www.npmjs.com/package/node-cron](https://www.npmjs.com/package/node-cron)                     |
| axios             | HTTP client                               | [https://www.npmjs.com/package/axios](https://www.npmjs.com/package/axios)                             |
| Cors              | Cross-Origin Resource Sharing             | [https://www.npmjs.com/package/cors](https://www.npmjs.com/package/cors)                               |
| Nodemailer        | Email sending               | [https://nodemailer.com/about/](https://nodemailer.com/about/)                               |

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🧑‍💻 Author Information

*   **[thevalidcode]**
    *   [Twitter: (https://twitter.com/thevalidcode)]
    *   [GitHub: (https://github.com/thevalidcode)]
    *   [LinkedIn: (https://linkedin.com/in/thevalidcode)]