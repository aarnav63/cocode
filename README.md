# CoCode - Code. Collab. Conquer.

CoCode is a dedicated, full-stack platform transforming how developers form teams for both **personal passion projects** and intense **hackathons**. Finding the right teammates—whether it's to build a startup idea on the weekend or compete in a 24-hour event—is often a chaotic process of spamming Discord channels or asking around arbitrarily. 

CoCode solves this by providing a unified, centralized **Role-Based Collaboration Platform**. It connects creators with developers looking for projects based on exact skill requirements, while simultaneously providing a streamlined space for Organizers to host and manage events.

---

## 🌟 Standout Features

### 1. Advanced Team-Building Engine
Forget unstructured team finding. On CoCode, Developers can:
- **Create Projects:** Pitch an idea and explicitly list the "Required Developer Skills" (e.g., UI/UX, React, Node.js).
- **Match & Request:** Other developers can explore open projects and send requests to join if they meet the skill criteria.
- **Manage Requests:** Project leaders get an intuitive dashboard to Accept or Reject incoming requests and build their perfect team.
- **Project Lifecycles:** Mark specific skill requirements as "Found", close projects to new requests when the team is full, and archive finished projects.

### 2. Role-Based Access Control (RBAC)
The platform dynamically routes and limits features based on your account type:
- **Organizers:** Dedicated dashboards to create, manage, and promote upcoming Hackathons to the entire developer network. They see an isolated view without the clutter of developer applications.
- **Developers:** Access to user profiles, project exploration, upcoming hackathons to participate in, and team creation.

### 3. Robust Security & Authentication
- Secure JWT-based Authentication.
- Safe password hashing via `bcryptjs`.
- Custom Express Middleware defending API routes from unauthorized access or manipulated tokens.

---

## 🛠️ The Workflow (How it Works)

1. **Sign Up / Login:**
   Choose your path! Sign in as an **Organizer** or a **Developer**.
2. **Organizers Launch Hackathons (Optional):**
   Organizers create event listings detailing when their hackathon happens, requirements, and tags.
3. **Developers Pitch Projects:**
   A developer launches a "Project"—either tied to a Hackathon or entirely independent for personal collaboration. They list the exact skills they lack to build it (e.g., "Need a Backend Dev!").
4. **The Sorting Phase:**
   Other developers navigate to the **Explore** tab, spot an exciting project, and hit *Request to Join*.
5. **Team Assembled:**
   The project creator accepts the request, and Boom! The team is finalized. 

---

## 💻 Tech Stack
- **Frontend:** React (Vite), React Router DOM, Axios, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB / Mongoose
- **Authentication:** JWT, Bcrypt

---

## 🚀 Running Locally

```bash
# 1. Clone the repo and install dependencies
cd client && npm install
cd ../server && npm install

# 2. Setup your .env in the /server directory
# Example: 
# PORT=5000
# MONGO_URI=your_mongo_string
# JWT_SECRET=your_secret

# 3. Start the Backend
cd server
npm start

# 4. Start the Frontend
cd client
npm run dev
```
