# API Client - Postman Clone

## Overview

API Client is a web-based HTTP request testing tool inspired by Postman, developed using React. The application allows users to create, customize, and send HTTP requests with different methods, manage request parameters, headers, and request bodies, and inspect server responses.

The project provides a modern and responsive user interface with features such as request history, collections management, multi-tab support, dark mode, and persistent local storage, allowing users to work with APIs without requiring a backend service.

---

## Features

### HTTP Request Management

* Send HTTP requests using common methods:

  * GET
  * POST
  * PUT
  * PATCH
  * DELETE
* Enter and validate HTTP/HTTPS URLs.
* Display meaningful validation errors for invalid requests.

---

### Query Parameters Management

* Add, edit, and remove query parameters.
* Manage parameters using a key-value interface.
* Automatically synchronize parameters with the final URL.

---

### Headers Management

* Add, edit, and delete request headers.
* Support custom headers such as:

  * Content-Type
  * Authorization
  * Custom API headers

---

### Request Body Editor

* Create request bodies in:

  * Raw text format
  * JSON format
* Use the editor for requests such as POST, PUT, and PATCH.

---

### Response Viewer

* Display HTTP response status codes.
* Show the content returned by the server.
* Provide clear feedback about request results.

---

### Error Handling

* Handle different types of errors including:

  * Network failures.
  * Invalid input data.
  * Server connection issues.
* Display user-friendly error messages.

---

### Request History & Collections

* Save request history automatically.
* Create and manage collections of requests.
* Organize frequently used API requests.
* Store all data using browser Local Storage.

---

### Import & Export

* Export collections as JSON files.
* Import previously saved collections.
* Transfer API collections between different devices.

---

### Multi-Tab Support

* Open multiple requests simultaneously.
* Keep each tab independent with its own:

  * URL
  * Parameters
  * Headers
  * Request body

---

### User Interface

* Modern and clean design.
* Responsive layout for different screen sizes.
* Dark mode support.
* Clear loading states while sending requests.
* Quick option to clear all request fields.

---

## Data Persistence

All application data is stored in browser Local Storage, allowing the user to keep:

* Request history.
* Collections.
* Request configurations.
* User preferences.

No backend or external database is required.

---

## Technologies Used

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Fetch API / Axios
* Browser Local Storage

---

## Learning Objectives

This project focuses on practical experience with:

* Building complex single-page applications with React.
* Managing component state and user interactions.
* Working with HTTP requests and REST APIs.
* Designing responsive user interfaces.
* Handling client-side data persistence.
* Implementing advanced UI features such as tabs, themes, and collections.

---

## Course

This project was developed as part of the **Web Programming** course.
