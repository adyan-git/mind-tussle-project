# MindTussle - Technical Documentation

## 1. Project Overview
MindTussle is an advanced, AI-adaptive quiz platform featuring real-time multiplayer battles, intelligent learning paths, and an extensive gamification system. It dynamically adjusts to user performance to provide a personalized studying experience, utilizing AI (Gemini API) to generate and analyze questions. Users can compete in real-time rooms, track detailed cognitive metrics, and participate in daily challenges and overall leaderboards.

## 2. Tech Stack
* **Frontend:** React, Tailwind CSS 
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose)
* **Real-Time Communication:** Socket.io
* **AI Integration:** Google Gemini API
* **Caching & Sessions:** Memory-cache, express-session (with connect-mongo in production)
* **Security & Utility:** Helmet, express-rate-limit, express-mongo-sanitize, node-cron

## 3. System Architecture
MindTussle operates on a robust Client-Server architecture utilizing both RESTful endpoints and real-time WebSockets.

* **Frontend-Backend-Database Flow:** The React frontend securely interacts with the Node.js/Express backend via REST APIs. Strict CORS policies and rate limiting are configured to protect these endpoints. The backend acts as the orchestrator, querying against MongoDB for user analytics, quiz data, and leaderboard states.
* **Real-time WebSockets (Socket.io):** An HTTP server wraps the Express app, alongside which Socket.io is initialized. This handles real-time data streaming for multiplayer quiz rooms, live leaderboards, and instant player status updates without requiring constant HTTP polling.
* **Intelligent Backend Workers:** `node-cron` scheduled workers run periodically in the background to automatically scrub inactive online users, evaluate and clean up empty gamification tournament records, and orchestrate daily challenge resets without blocking the main event-loop.
* **AI Processing Layer:** Gemini API handles prompt-based question generation, passage auto-filling, and adaptive hint processing, strictly guarded by an `aiLimiter` and an `aiQuestionLimiter` to prevent rate-limit exhaustion.

## 4. Database Schema
The database (MongoDB) utilizes Mongoose schemas to map application entities. The core models include:

### `User` (UserQuiz)
Manages user authentication, profile details, extensive gamification mechanics, and AI learning metrics.
* **Key Fields:** `name`, `email`, `role`, `xp`, `totalXP`, `level`, `loginStreak`, `intelligence` (AI-adaptive hints and stats), `performanceHistory`, `gamification` (skill trees, titles), `friends`.

### `Quiz`
Stores quiz metadata, associated questions, and difficulty tracking metrics.
* **Key Fields:** `title`, `category`, `totalMarks`, `duration`, `questions` (Array containing `question`, `options`, `correctAnswer`, `difficulty`, `_qualityScore`), `difficultyDistribution`, `averageScore`.

### `Report`
Records the granular results of user quiz attempts, feeding into the adaptive AI flow.
* **Key Fields:** `username`, `quizName`, `score`, `total`, `difficulty`, `questions` (detailed tracking of `userAnswer`, `correctAnswer`, and `answerTime` per question).

### `Challenge` (Alias to DailyChallenge)
Handles the daily tasks assigned to users for bonus experience and engagement.
* **Key Fields:** Used alongside user metrics to track streak compliance and expiration dates.

## 5. API Documentation
The application features organized routing controllers (`/api/*`). Below are the primary interaction endpoints.

### AI Integration Endpoints
* **`POST /api/quizzes/gemini-autofill` (Admin Only)**
  * **Role:** Leverages the Gemini API to automatically generate questions based on an unstructured text passage.
  * **Middleware Flow:** `protect` → `adminOnly` → `aiQuestionLimiter`.
  * **Behavior:** Processes the submitted passage, invokes the LLM prompt wrapper, and inserts the generated questions directly into the platform. Requires admin access to ensure cost and pipeline control.
* **`POST /api/adaptive`**
  * **Role:** Generates adaptive test questions on the fly based on the user's cognitive performance model.
* **`POST /api/quizzes/:id/generate-questions`**
  * **Role:** Dynamically builds a quiz using targeted topic parameters. Empties related cache patterns natively.

### Quiz & Reporting Endpoints
* **`GET /api/quizzes` & `GET /api/quizzes/:id`** - Retrieves quiz catalogs and dedicated quiz configurations via cached responses limiters.
* **`POST /api/reports`** - Submits a quiz attempt, triggering XP gains, user level-ups, and performance recalculations.
* **`GET /api/reports/top-scorers`** - Retrieves the overall best statistics for a specific quiz block.

### Gamification Endpoints
* **`admin` `DELETE /api/challenges/cleanup-empty`** - Manual triggering of stale challenge culling. 

## 6. Admin vs. User Features
Roles dictate functional access via RBAC (Role-Based Access Control) defined in the JWT payload and User schema.

### User Dashboard (role: "user")
* Participate in dynamically weighted quizzes.
* Track analytics, cognitive metrics, and performance history reports.
* Level up progression trees and earn XP / Badges based on performance.
* Participate in multiplayer Socket.io lobbies and add friends.
* Use AI Study Buddy for personalized guidance.

### Admin Suite (role: "admin")
* Full create, read, update, and delete (CRUD) abilities spanning over quizzes and questions.
* Invoke **AI Generation features (e.g., `gemini-autofill`)** to massively produce content pipelines.
* Explicit management arrays over platform parameters (e.g., triggering migration scripts, purging temporary gamification caching arrays).
* Monitoring server health, analytics routes, and user statistics without limitations.

## 7. Setup Instructions

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB Database Instance (Atlas or Local)
* A valid Google Gemini API Key

### Step-by-Step Initialization

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd MindTussle
   ```

2. **Install Backend Dependencies**
   Navigate to the backend directory to install modules.
   ```bash
   cd backend
   npm install
   ```

3. **Configure the Backend Environment (.env)**
   Create a `.env` file within the `backend` directory. Populate it with the following core variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   FRONTEND_URL=http://localhost:5173
   GOOGLE_SECRET=your_minimum_16_character_secret_here
   GEMINI_API_KEY=your_gemini_key_here
   NODE_ENV=development
   ```

4. **Install Frontend Dependencies**
   Navigate to the frontend directory.
   ```bash
   cd ../frontend
   npm install
   ```

5. **Configure the Frontend Environment (.env)**
   Create a `.env` file inside `frontend`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

6. **Run the Project Locally**
   You can either open two terminal instances or utilize a script if configured in root.
   - **Terminal 1 (Backend):**
     ```bash
     cd backend
     npm run dev
     ```
   - **Terminal 2 (Frontend):**
     ```bash
     cd frontend
     npm run dev
     ```

7. **Access the App:** Open your browser to `http://localhost:5173` to explore MindTussle.
