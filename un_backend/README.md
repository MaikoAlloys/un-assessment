# UN BACKEND

This is the backend API for the UN-Habitat Project Management System built with Node.js and Express.

##  Setup Instructions

1. **Download and unzip** the project folder.
2. Navigate to the project directory in your terminal:
   ```bash
   cd un_backend
````

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Create a `.env` file** in the root of the project and configure the following:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=un_habitat
   ```

5. **Start the server:**

   ```bash
   npm start
   ```

6. The API will run at:
   `http://localhost:5000/`

## 🛠 Features

* RESTful CRUD API for managing projects
* JSON endpoints for filtering by:

  * Country
  * Approval Status
* Supports frontend consumption and dashboard visualizations

##  Folder Structure

* `routes/` — API route definitions
* `controllers/` — business logic
* `models/` — database queries and table access
* `config/` — DB connection setup
* `app.js` or `index.js` — entry point

##  Example Endpoints

* `GET /api/projects/all`
* `GET /api/projects/country/Kenya`
* `GET /api/projects/Approval Status/Approved`
* `POST /api/projects` — Create project
* `PUT /api/projects/:id` — Update project
* `DELETE /api/projects/:id` — Delete project

##  Tech Stack

* Node.js
* Express
* MySQL or MariaDB
* dotenv
* CORS / body-parser

##  Database

* Ensure MySQL server is running
* Import the SQL dump file (`un_habitat.sql`) into your database

