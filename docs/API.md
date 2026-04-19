# MindTussle APIs

This document outlines the main API routes available in the MindTussle backend, including request bodies and expected responses. This is essential for understanding how the frontend and backend communicate.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Users (`/users`)

### `POST /users/register`
Creates a new user account.
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhb...",
    "user": { "_id": "...", "name": "Jane", "email": "..." }
  }
  ```

### `POST /users/login`
Authenticates a user.
* **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhb...",
    "user": { "_id": "...", "role": "user" }
  }
  ```

### `GET /users/me`
Retrieves the profile of the currently authenticated user.
* **Headers:** `Authorization: Bearer <Token>`
* **Response (200 OK):**
  ```json
  {
    "_id": "5f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "xp": 1500,
    "level": 3
  }
  ```

---

## 2. Quizzes (`/quizzes`)

### `GET /quizzes`
Retrieves a list of all available quizzes.
* **Headers:** `Authorization: Bearer <Token>`
* **Response (200 OK):**
  ```json
  [
    {
      "_id": "...",
      "title": "JavaScript Basics",
      "category": "Technology",
      "totalAttempts": 142
    }
  ]
  ```

### `GET /quizzes/:id`
Retrieves detailed information and questions for a specific quiz.
* **Headers:** `Authorization: Bearer <Token>`
* **Response (200 OK):**
  ```json
  {
    "_id": "...",
    "title": "JavaScript Basics",
    "questions": [
      {
        "question": "What is closure?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    ]
  }
  ```

### `POST /quizzes` (Admin Only)
Creates a new quiz.
* **Headers:** `Authorization: Bearer <Token>`
* **Request Body:**
  ```json
  {
    "title": "React Advanced",
    "category": "Frontend",
    "totalMarks": 100,
    "duration": 30,
    "questions": [ { "question": "...", "correctAnswer": "...", "options": [...] } ]
  }
  ```

---

## 3. Generative AI Routes

### `POST /quizzes/gemini-autofill` (Admin Only)
Parses an unstructured text passage using the Google Gemini model and automatically infers/creates quiz questions.
* **Headers:** `Authorization: Bearer <Token>`
* **Request Body:**
  ```json
  {
    "passage": "Photosynthesis is the process by which green plants...",
    "questionCount": 5,
    "difficulty": "medium"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Questions generated successfully",
    "generatedQuestions": [
      {
        "question": "What is photosynthesis?",
        "options": ["A process", "A plant", "An animal", "A bacteria"],
        "correctAnswer": "A process"
      }
    ]
  }
  ```

### `POST /adaptive`
Dynamically generates questions tailored to the user's intelligence profile and previous completion stats.
* **Headers:** `Authorization: Bearer <Token>`
* **Response (200 OK):**
  Returns a custom-built quiz JSON array based on user's weak points.

---

## 4. Reports & Telemetry (`/reports`)

### `POST /reports`
Submits a grading sheet after the user finishes a quiz attempt. Used to calculate XP, Levels, and adjust adaptive difficulty models.
* **Headers:** `Authorization: Bearer <Token>`
* **Request Body:**
  ```json
  {
    "username": "Jane Doe",
    "quizName": "JavaScript Basics",
    "quizId": "...",
    "score": 8,
    "total": 10,
    "difficulty": "medium",
    "questions": [
      {
        "questionText": "What is closure?",
        "options": ["A", "B", "C", "D"],
        "userAnswer": "A",
        "userAnswerText": "A function that remembers its outer variables",
        "correctAnswer": "A",
        "correctAnswerText": "A function that remembers its outer variables",
        "answerTime": 15
      }
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "Report saved successfully",
    "report": { ... },
    "xpGained": 80,
    "levelUp": false
  }
  ```

### `GET /reports/user`
Gets the historical performance list for the authenticated user.
* **Headers:** `Authorization: Bearer <Token>`
* **Response (200 OK):** Lists past reports.
