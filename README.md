# Patient Management System (Frontend with PGLite)

A simple, client-side patient management system built with React, leveraging PGLite for an in-browser PostgreSQL-compatible database. This application demonstrates patient registration, viewing, and basic data integrity features.

## Table of Contents

-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Setup and Installation](#setup-and-installation)
-   [Running the Application](#running-the-application)
-   [Database (PGLite)](#pglite-database)
    -   [Data Model](#data-model)
    -   [Data Persistence](#data-persistence)
-   [Core Components](#core-components)
-   [Deployment](#deployment)

## Features

* **Patient Registration:**
    * Form to input patient details: Full Name, Address, Phone, Date of Birth, Remarks.
    * **Client-Side Validation:**
        * Required fields: Name, Address, Phone, Date of Birth.
        * Phone number format (exactly 10 digits).
        * Date of Birth validation (cannot be in the future, cannot be older than 110 years).
        * Asynchronous check for unique phone numbers before submission.
    * Submit button disabled until all client-side validations pass.
* **Patient Listing:**
    * Displays a table of all registered patients.
    * Includes ID, Name, Address, Phone, Date of Birth, and Remarks.
    * Dynamic count of registered patients.
* **Status Messages:** Provides feedback on database initialization, patient registration success/failure, and validation errors.
* **Responsive Design:** Basic responsiveness for form and table layouts.
* **In-Browser Database:** Utilizes PGLite, meaning no separate backend server is required for data storage.

## Technologies Used

* **React:** Frontend JavaScript library for building user interfaces.
* **PGLite (PostgreSQL in WebAssembly):** Enables running a PostgreSQL-compatible database directly in the browser's WebAssembly environment.
* **HTML/CSS:** Semantic HTML structure and custom CSS for styling (mimicking a utility-first approach like Tailwind CSS).
* **JavaScript (ES6+):** For application logic and state management.

## Setup and Installation

To get this project up and running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/l-ashar-l/patient-registration-app
    cd patient-registration-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Application

After installation, you can start the development server:

```bash
npm run dev
# or
yarn dev
```

## Pglite Database
- PGLite is a groundbreaking technology that compiles PostgreSQL to WebAssembly (WASM).
- This allows a fully functional PostgreSQL-compatible database to run directly within the browser's environment.

## Data Model
The application uses a single table named `patients` to store all patient records. This table is automatically created with the following schema upon the first load or if the database is reset:

```sql
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    dob TEXT NOT NULL,
    remarks TEXT
);
```

## Data Persistence
Data stored in PGLite persists across browser sessions because it uses the browser's IndexedDB.

* **Data Location:** Patient data is stored in your browser's local storage (IndexedDB).
* **Resetting Data:** If you clear your browser's site data for the application's domain, the PGLite database will reset.
* **No Server-Side Storage:** Importantly, data is **not** stored on any remote server; it's entirely client-side.

---

## Core Components

* **`DBContext.jsx`:** This component is central to database management. It initializes the PGLite database instance when the application loads, handles the creation of the necessary database schema (the `patients` table), and manages the database's readiness status. It provides the PGLite `db` instance, `dbReady` status, and current `dbStatus` messages to all consuming components via React Context. The use of `useMemo` ensures that the context value is memoized, preventing unnecessary re-renders of components that consume this context.

* **`PatientForm.jsx`:** This component is responsible for the user interface and logic related to registering new patients. It incorporates comprehensive input and validation features:
    * It performs synchronous validation checks for required fields (`name`, `address`, `phone`, `dob`), ensures the `phone` number adheres to a 10-digit format, and validates the `dob` to ensure it's not in the future and within a reasonable age range.
    * It includes an **asynchronous validation** step to query the PGLite database and confirm the uniqueness of the entered `phone` number before allowing form submission.
    * Validation errors are displayed dynamically on `blur` events for each input field.
    * The form's submit button is conditionally disabled until all client-side validation rules are satisfied.
    * Upon successful validation, it interacts directly with the PGLite database to insert new patient records.

* **`PatientList.jsx`:** This component handles the display of all registered patient records.
    * It fetches the list of patients from the PGLite database.
    * It renders the retrieved patient data in a clear, structured table format, presenting columns for ID, Name, Address, Phone, Date of Birth, and Remarks.
    * It also dynamically updates and displays the total count of registered patients.

* **`SqlConsole.jsx`:** This component executes the raw sql that is provided to it.
    * It has a text input that accepts the raw sql queries that are validated further.
    * It makes changes in the database or fetches records as per the queries type.
    * It returns the rows that were affected in the query execution and the rows that are returned by the query.

* **`StatusMessage.jsx`:** This is a reusable utility component designed to provide immediate user feedback.
    * It displays various types of messages, such as success confirmations for patient registration, error notifications during database operations or validation failures, and general information messages.
    * Messages are styled to visually differentiate between success (green), error (red), and other states.
    * It includes a close button, allowing users to dismiss the message manually.

---

## Deployment

This application is designed for easy deployment to static hosting services due to its client-side nature and the use of PGLite for an in-browser database (eliminating the need for a separate backend server).

**The Application has been successfully deployed and is live at:**
👉 **[https://vocal-flan-7ed563.netlify.app/](https://vocal-flan-7ed563.netlify.app/)** 👈

---
