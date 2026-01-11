# SpiceVault Setup Guide

This guide provides instructions for setting up the SpiceVault project for local development. The project is a full-stack application with a separate backend and frontend.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: A recent LTS version (v18 or v20 is recommended).
- **npm**: Should be installed automatically with Node.js.
- **MySQL**: A running MySQL server instance. You can install it from the official website or use a tool like Docker.
- **Code Editor**: A text editor or IDE, such as Visual Studio Code.

---

## 1. Backend Setup

The backend is an Express.js application that connects to a MySQL database.

### Steps

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a new file named `.env` in the `backend` directory. This file will store your secret credentials and configuration.

4.  **Configure your environment:**
    Copy the following template into your `backend/.env` file and replace the values with your local MySQL database details.

    ```env
    # MySQL Database Configuration
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password # Replace with your MySQL root password or a dedicated user's password
    DB_NAME=spicevault

    # Application Configuration
    PORT=5000
    JWT_SECRET=a_secure_random_string_for_jwt # Replace with a long, random string
    ```

5.  **Set up the database:**
    - Make sure your MySQL server is running.
    - Connect to MySQL and create the database for the project.
      ```sql
      CREATE DATABASE spicevault;
      ```

6.  **Prepare the database schema and data:**
    Run the following commands in order from the `backend` directory to create the necessary tables and seed them with initial data.

    ```bash
    # Create Machine Learning related tables
    npm run create:ml-tables

    # Create test users for the application
    npm run create:test-users

    # Seed the database with ML data
    npm run seed:ml
    ```

7.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The backend server should now be running on the port you specified in `.env` (e.g., `http://localhost:5000`).

---

## 2. Frontend Setup

The frontend is a React application created with Create React App.

### Steps

1.  **Navigate to the frontend directory** (from the project root):
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a new file named `.env` in the `frontend` directory.

4.  **Configure your environment:**
    Copy the following into your `frontend/.env` file. This tells the React app where to send its API requests.

    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```
    *(Note: The port `5000` should match the `PORT` in the backend's `.env` file.)*

5.  **Start the frontend server:**
    ```bash
    npm start
    ```
    The React development server will start, and the SpiceVault application should open in your web browser, typically at `http://localhost:3000`.

---

## Conclusion

At this point, you should have both the backend and frontend servers running in separate terminal windows. The application should be fully functional, connecting to your local database for all operations.
