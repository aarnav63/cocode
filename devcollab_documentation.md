# DevCollab (CoCode) - Comprehensive Application Documentation

Welcome to the architectural documentation for **DevCollab** (also referred to as CoCode), a full-stack MERN application built to facilitate connections between Event Organizers and Developers for hackathons and projects. 

This document breaks down the entire application structure, explaining every feature, file, folder, and API endpoint from the ground up.

---

## 🏗️ 1. Global Architecture Overview

The app is built using the **MERN Stack**:
- **MongoDB**: The NoSQL database hosting schema collections for Users, Projects, Hackathons, Ratings, and Teams.
- **Express.js & Node.js**: The backend server that exposes a RESTful API and manages Google OAuth and JWT-based authentication.
- **React (Vite)**: A blazing fast modern frontend built with Vite, utilizing React Router for single-page navigation and Axios for API requests.

The application uses **Role-Based Access Control (RBAC)** to differentiate between `developer` interactions (applying to teams, exploring hackathons) and `organizer` interactions (creating hackathons, managing developer requests).

---

## 🖥️ 2. The Frontend Client (`/client`)

The frontend is a Vite-powered React application with a cohesive Glassmorphism CSS aesthetic defined in `index.css`.

### Core Configuration
- `client/src/main.jsx`: The absolute entry point of the React tree. This file globally sets `axios.defaults.baseURL` to match your Vercel `VITE_API_URL` environment variable for dynamic production API routing.
- `client/vercel.json`: Configuration to instruct Vercel to route all traffic to `index.html`, eliminating 404 errors during client-side routing.
- `App.jsx`: The layout skeleton. Wraps the app in `<GoogleOAuthProvider>`, invokes standard layout containers (`.app-container`), renders the `<Navbar />`, `<Routes>`, and the sticky `<Footer />`.

### Components (`/client/src/components`)
- **`Navbar.jsx`**: The sidebar navigation pane. Contains conditional logic to show different navigation items based on whether the logged-in user is an `organizer` or a `developer`.
- **`Footer.jsx`**: A modern, fixed glassmorphism pill at the bottom of the screen. Holds social branding (GitHub, LinkedIn) and "Made with ❤️".

### Pages (`/client/src/pages`) - *The Core Views*
1. **`Login.jsx`**
   - **Purpose**: Fully handles authentication via Google OAuth. 
   - **Flow**: Displays a custom frosted-glass "Continue with Google" button hooked up via the `@react-oauth/google` library. If a user is not found in the DB, it enters a `requireOnboarding` state, forcing the user to provide their location, skills, and phone number before granting entry.
2. **`Home.jsx`**
   - **Purpose**: The main activity dashboard.
   - **Features**: Fetches current active hackathons. Allows developers to see project requests they've made, accept/reject offers, and create new rapid projects. 
3. **`Explore.jsx`**
   - **Purpose**: The matching ground.
   - **Features**: Developers can browse open projects and hackathons. Clicking "Request to Join" on a project hits the backend `request` endpoint.
4. **`HackathonDetails.jsx`**
   - **Purpose**: Deep dive into specific events.
   - **Features**: Displays the hackathon banner, constraints, prizes, and specific teams forming for that hackathon. Note: Includes specific backend fetches using hackathon `id` parameters.
5. **`OrganizerDashboard.jsx`**
   - **Purpose**: A strictly gated portal for users with the `organizer` role.
   - **Features**: Organizers can post new hackathons to the database and review developers asking to join standard teams.
6. **`Profile.jsx`**
   - **Purpose**: Trust and statistics hub.
   - **Features**: Generates a user's `trustScore` mapping their Communication, Leadership, and Reliability metrics, along with their tech stack.

---

## ⚙️ 3. The Backend Server (`/server`)

The Express backend securely processes data strings, handles image/asset references, establishes MongoDB connectivity, and serves JSON locally and over Railway/Render.

### Core Configuration
- **`index.js`**: The master initialization script. Invokes `dotenv` (dynamically resolving paths using Node's `fileURLToPath` for robust pathing), starts standard middleware (`cors`, `express.json`), links all sub-routers to `/api/...`, and starts `app.listen()`.
- **`config/db.js`**: Reaches out asynchronously to `mongoose.connect(process.env.MONGO_URI)` to bridge the application to your MongoDB Atlas cluster.
- **`package.json`**: Contains the `"start": "node index.js"` command heavily relied upon by cloud servers for deployment.

### Database Schema Models (`/server/models`)
- **`User.js`**: The most critical model. Stores `email`, `name`, optional `password`, `googleId` (used for OAuth validation), RBAC `role`, contact `phone`, and embedded `trustScore` object mapping multi-dimensional user ratings.
- **`Hackathon.js`**: Stores hackathon metadata (Name, Dates, Size, Links).
- **`Project.js`**: Governs developer teams. Tracks who the `owner` is, array of `tags` (Tech Stack required), an array of `requestedMembers`, and `acceptedMembers`.
- **`Rating.js`**: Allows users to rate developer partners post-competition.
- **`Team.js`**: Group structural model tying users to Hackathons.

### Middleware (`/server/middleware`)
- **`authMiddleware.js`**: The gatekeeper. Validates JSON Web Tokens attached to `Authorization: Bearer <token>` incoming requests. If the JWT is valid, it decodes the payload, queries the database for the user payload, and injects `req.user` for downstream routes to securely use.

---

## 🚦 4. Backend API Routes & Controllers

The backend abstracts business logic away from the `routes` directory into the strictly defined `controllers` directory. 

### Authenticaton (`/api/auth`) -> `authController.js`
- **POST `/google`**: Receives an `access_token` from React. Uses the Fetch API securely backend-to-backend to query `https://www.googleapis.com/oauth2/v3/userinfo`. Creates JWT tokens for existing users, or informs frontend that new users need onboarding.
- **POST `/complete-profile`**: The finalization endpoint where new users drop their `skills`, `phone`, and stringified `location` to be inserted into MongoDB alongside their Google IDs.
- **GET `/me`**: Protected route that fetches the `req.user` derived from the frontend session's JWT token.

### Users (`/api/users`) -> `userController.js`
- **GET `/developers`**: Allows filtering the database to find talent (e.g. mapping queries where `role` === 'developer'). Can accept tech-stack strings in req queries.
- **GET `/:id/stats`**: Aggregates the historical Ratings schema to spit out an average Trust Score block for the `Profile.jsx` view.

### Projects (`/api/projects`) -> `projectController.js`
- **GET `/`**: Pulls all active projects for the Explore tab.
- **POST `/`**: Developer action to spin up a new internal project board.
- **GET `/me`**: Filters projects where `owner` = `req.user._id`.
- **POST `/:id/request`**: Pushes a User ID into a project's `requestedMembers` queue.
- **PUT `/:id/accept/:userId`**: The project owner approves a request, shifting the user from `requestedMembers` to `acceptedMembers`.

### Hackathons (`/api/hackathons`) -> `hackathonController.js`
- **GET `/`**: Feeds the active hackathon list string to the homepage.
- **POST `/`**: (Organizer only) Writes a new hackathon document.
- **GET `/:id`**: Deep fetches a single hackathon.

### Ratings (`/api/ratings`) -> `ratingController.js`
- **POST `/`**: Accepts numerical inputs (1-5) and text reviews from a teammate applied to another teammate. Forces mathematical recalculation on the target `User` object's `totalRatings` map securely.

### Teams (`/api/teams`) -> `teamController.js`
- **POST `/`**: Assembles an official entity representing developers linked securely via ObjectIDs entering a specific `Hackathon`.

---

## 🚀 5. Deployment Workflow & Cloud Architecture

### Frontend (Vercel)
- React code is compiled strictly executing `npm run build` by Vercel. 
- During compilation, `VITE_API_URL` environment variables are locked into the static bundles, directing all Axios networking dynamically to Render/Railway over the internet, completely decoupling the frontend from your laptop environment.
- `vercel.json` guarantees Single Page App routing doesn't trigger 404s.

### Backend (Railway / Render)
- Runs raw `node index.js` via the `start` script. 
- Heavily dependent on Dashboard variables (`MONGO_URI`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`). 
- Features widespread CORS configuration allowing the browser (Origin: Vercel) to interact with the API securely without being blocked by Chrome's generic fetch restrictions.

---

### 🎨 6. Why Glassmorphism?
The core branding of DevCollab sets it apart. Instead of plain Tailwind templates, `index.css` employs custom overlapping `rgba` background codes combined with massive `backdrop-filter: blur(12px)` filters. Combining overlapping shadows on hovering `<svg>` inputs gives users immediate interactivity while scrolling through highly complex relational data models!
