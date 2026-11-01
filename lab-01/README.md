# Lab 1: Node.js and Express Server

## Student Details

* **Name:** Sankala Ujwala
* **Registration Number:** 252U1R8086
* **Section:** CSE(QE)-1B, S13, 204

## Live Deployment

**Live URL:** https://ujwala-nodejs-lab1.onrender.com

## Aim

To create a server using Node.js and Express.js and implement HTTP routes.

## Technologies Used

* Node.js
* Express.js
* JavaScript

## Installation and Execution

1. Install Node.js.

2. Open the project folder in VS Code.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

## API Endpoints

| Method | Endpoint | Description                      | Status |
| ------ | -------- | -------------------------------- | ------ |
| GET    | `/`      | Displays welcome message         | 200    |
| GET    | `/about` | Displays student details in JSON | 200    |
| GET    | `/time`  | Displays current date and time   | 200    |
| GET    | `/hello` | Displays 404 error               | 404    |

## Screenshots

### Home Page

![Home](screenshots/home.png)

### About Page

![About](screenshots/about.png)

### Time Page

![Time](screenshots/time.png)

### 404 Page

![Not Found](screenshots/not-found.png)

## Understanding package.json

* **name:** Project name.
* **version:** Current project version.
* **description:** Short description of the project.
* **main:** Entry point of the application.
* **scripts:** Commands used to run the project.
* **keywords:** Tags related to the project.
* **author:** Project creator.
* **license:** Project usage license.
* **dependencies:** External packages required by the project.

## Result

Successfully created and deployed a Node.js server using Express.js with appropriate HTTP routes and status codes.
