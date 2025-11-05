# SlotSwapper - ServiceHive Full Stack Challenge

This is a full-stack MERN application built for the ServiceHive technical challenge. It's a peer-to-peer time-slot scheduling application that allows users to post their busy slots and swap them with other users.

The application is fully functional, styled, and includes a real-time notification feature for new swap requests.

## Live Demo

* **Live App:** [https://slot-swapper-project.vercel.app/](https://slot-swapper-project.vercel.app/)

*(Note: The backend is deployed on Render's free tier, which may take 30-60 seconds to "wake up" on the first request.)*

---

## Technology Stack

* **Frontend:** React (Context API for state management, React Router)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JWT (JSON Web Tokens) & bcrypt
* **Styling:** Custom CSS

---

## Core Features

* **JWT Authentication:** Secure user signup and login.
* **Protected Routes:** Users cannot access app pages without being logged in.
* **Calendar Management (CRUD):** Users can create, view, update, and delete their own calendar slots.
* **Marketplace:** A public-facing view of all slots marked as "SWAPPABLE" by other users.
* **Core Swap Logic:** A complete end-to-end system for requesting, accepting, and rejecting swaps.
* **Transactional Swap:** When a swap is accepted, the `owner` field of both slots is atomically exchanged.
* **Real-time Notifications:** A notification icon in the navbar shows the count of new, pending incoming requests.
* **Responsive UI:** A clean, modern, and mobile-friendly user interface.

---

## How to Run Locally

To get this project running on your local machine, please follow these steps.

### Prerequisites

* Node.js (v16 or later)
* A MongoDB Atlas account (or a local MongoDB instance)

### 1. Clone the Repository

```bash
git clone [https://github.com/raonapoleon/slot-swapper-project.git](https://github.com/raonapoleon/slot-swapper-project.git)
cd slot-swapper-project

### 2. Backend Setup

# 1. Navigate to the backend folder
cd backend

# 2. Install all dependencies
npm install

# 3. Create a .env file
#    You must add your own variables to this file:

PORT=5000
MONGO_URI=your_mongodb_connection_string_goes_here (I have not shared my mongodb connection string, so please create one new for your setup)
JWT_SECRET=any_random_string_works_for_a_secret

# 4. Start the backend server (it will run on http://localhost:5000)
npm start

### 3. Frontend Setup

# 1. Navigate to the frontend folder
cd frontend

# 2. Install all dependencies
npm install

# 3. Start the frontend app (it will open in your browser)
npm start
```
## API Endpoints

All protected routes require an `x-auth-token` header.

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/auth/signup` | Register a new user. | No |
| `POST` | `/api/auth/login` | Log in a user and get a token. | No |
| `GET` | `/api/auth/user` | Get the logged-in user's data. | Yes |
| **Events** | | | |
| `POST` | `/api/events` | Create a new event. | Yes |
| `GET` | `/api/events/mine` | Get all events owned by the user. | Yes |
| `PUT` | `/api/events/:id` | Update an event (e.g., set status). | Yes |
| `DELETE`| `/api/events/:id` | Delete an event. | Yes |
| **Swap** | | | |
| `GET` | `/api/swap/swappable-slots` | Get all events from *other* users marked "SWAPPABLE". | Yes |
| `GET` | `/api/swap/my-requests` | Get all incoming and outgoing swap requests for the user. | Yes |
| `POST` | `/api/swap/request` | Create a new swap request. | Yes |
| `POST` | `/api/swap/response/:id` | Accept or reject an incoming swap request. | Yes |
