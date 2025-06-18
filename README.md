# 🚀 Social Media Store Backend: Powering Your Online Empire

Crafted with Express.js, this backend is the powerhouse driving a seamless social media store experience. It manages users, processes orders, syncs with providers, and keeps everything running smoothly with scheduled cron jobs.

## ✨ Project Highlights

-   **User Management**: Securely handles user authentication, creation, and profile updates.
-   **Order Processing**: Manages order placements, refills, and status updates with integrated error handling.
-   **Provider Synchronization**: Automatically syncs services and order details with external providers.
-   **Real-time Updates**: Leverages Socket.IO for real-time user status and notifications.
-   **Email Notifications**: Sends automated emails for new users, orders, and critical updates.
-   **Admin Interface**: Secured admin login with Swagger documentation.

## 🛠️ Installation

Get started by setting up the project locally. Follow these steps:

-   **Clone the Repository**:
    ```bash
    git clone https://github.com/thevalidcode/social-media-store-backend.git
    ```
-   **Navigate to the Project Directory**:
    ```bash
    cd social-media-store-backend
    ```
-   **Install Dependencies**:
    ```bash
    npm install
    ```
-   **Set Up Environment Variables**:
    Create a `.env` file in the root directory and configure the following variables:
    ```
    DB_HOST=your_db_host
    DB_PORT=your_db_port
    VSP_DB_NAME=your_vsp_db_name
    VSP_DB_USER=your_vsp_db_user
    VP_DB_NAME=your_vp_db_name
    VP_DB_USER=your_vp_db_user
    DB_PASSWORD=your_db_password
    SESSION_SECRET=your_session_secret
    ADMIN_USERNAME=your_admin_username
    ADMIN_PASSWORD=your_admin_password
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    MASTER_KEY=your_master_key # 32-character encryption key
    RATE_KEY=your_apilayer_api_key
    NODE_ENV=development # or production
    ```
-   **Run the Application**:
    ```bash
    npm start
    ```

## ⚙️ Usage

The application provides several key features accessible through its API endpoints.

### Running the Development Server
To start the development server, use the following command:

```bash
npm start
```

This will launch the server, and you can access it via `http://localhost:6060/`.

### API Endpoints

- **User Authentication:**
  - `/user/me`: Authenticates a user based on provided credentials.
  - `/auth/google`: Authenticates or registers a user via Google OAuth.

- **User Management:**
  - `/user`: Retrieve all users (Admin Only).
  - `/user/:uid`: Retrieve a specific user by UID (Admin Only).
  - `/user`: Create a new user.
  - `/user`: Update an existing user (Admin Only).
  - `/user`: Delete a user (Admin Only).
  - `/user/multiple`: Delete multiple users (Admin Only).

- **Panel Data:**
  - `/panel/panel_id`: Retrieve panel ID.
  - `/panel/styles`: Retrieve panel styles.
  - `/panel/site-data`: Retrieve panel site data.
  - `/panel/rates`: Retrieve panel exchange rates.
  - `/panel/current-user`: Retrieve current user.
  - `/panel/current-admin`: Retrieve current admin.

- **Admin Authentication:**
  - `/admin/login`: Admin login route.
  - `/admin/logout`: Admin logout route.

## ✨ Key Features

-   **Secure Authentication:** Utilizes bcrypt for password hashing and JWT for secure session management.
-   **Real-time Communication:** Implements Socket.IO for real-time updates, such as user status and messaging.
-   **Automated Synchronization:** Employs cron jobs for scheduled tasks like syncing orders, updating services, and saving exchange rates.
-   **Customizable Email Notifications:** Sends emails using predefined templates for various events.
-   **API Key Management:** Provides API keys for secure access to backend functionalities.
-   **Currency Conversion:** Converts currencies using live exchange rates.
-   **Admin Interface**: Protected admin routes for managing users and configurations.
-   **Google OAuth**: Implements Google OAuth for seamless user authentication.

## 🛠️ Technologies Used

| Technology   | Description                                                                                                | Documentation                                                                                |
| :----------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| Express.js   | A minimal and flexible Node.js web application framework.                                                | [https://expressjs.com/](https://expressjs.com/)                                            |
| pg           | PostgreSQL client for Node.js.                                                                            | [https://node-postgres.com/](https://node-postgres.com/)                                      |
| bcrypt       | Library for hashing passwords.                                                                             | [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)                   |
| jsonwebtoken | Library for creating JSON Web Tokens.                                                                     | [https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)       |
| Axios        | Promise based HTTP client for the browser and node.js                                                      | [https://axios-http.com/](https://axios-http.com/)                                          |
| Nodemailer   | Module for Node.js applications to allow easy email sending                                                | [https://nodemailer.com/](https://nodemailer.com/)                                          |
| Socket.IO    | Library that enables real-time, bidirectional and event-based communication between the web client and server. | [https://socket.io/](https://socket.io/)                                                   |
| node-cron    | A task scheduler for Node.js.                                                                              | [https://www.npmjs.com/package/node-cron](https://www.npmjs.com/package/node-cron)             |
| Swagger UI   | Tools to visualize and interact with the API’s resources without having any of the implementation logic in place. | [https://swagger.io/tools/swagger-ui/](https://swagger.io/tools/swagger-ui/)            |

## 👤 Author

**[Valid Code]**

-   [GitHub](https://github.com/thevalidcode)
-   [LinkedIn](https://www.linkedin.com/in/thevalidcode)
-   [Twitter](https://twitter.com/thevalidcode)
