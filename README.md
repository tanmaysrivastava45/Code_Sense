# CodeSense

CodeSense is an AI-powered code analysis platform with real-time collaboration. It uses Google Gemini for analysis, JWT for authentication, MongoDB for persistence, and Socket.IO for live collaborative rooms.

## Live App

Frontend: https://code-sense-six.vercel.app/

Backend API: https://code-sense-iynm.onrender.com/

## Features

### Code Analysis

- Syntax error detection
- Time complexity analysis
- Space complexity analysis
- Code explanation
- Improvement suggestions
- Analysis history
- PDF export

### Authentication

- JWT-based login and protected routes
- Email verification with Nodemailer
- Resend verification flow
- Forgot password and reset password flow
- Session-aware frontend auth state

### Real-Time Collaboration

- Create and join collaboration rooms
- Live code sync with Socket.IO
- Shared language selection
- Presence and room user count
- Shareable room IDs
- Collaborative analysis inside a room

### Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- Go
- Rust

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO Client
- Monaco Editor
- React Markdown
- jsPDF

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt
- Nodemailer
- Socket.IO
- Google Gemini API

## Architecture

- `frontend/`: React client
- `backend/`: Express API, MongoDB models, auth, email, and collaboration socket server
- Authentication is handled with JWT
- Persistent data is stored in MongoDB

## Main Backend Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Analysis

- `POST /api/analysis/analyze`
- `POST /api/analysis/analyze-all`
- `GET /api/analysis/history`

### Collaboration

- `POST /api/collaboration/rooms/create`
- `GET /api/collaboration/rooms`
- `GET /api/collaboration/rooms/:roomId`
- `DELETE /api/collaboration/rooms/:roomId`

## Environment Variables

### Backend

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=http://localhost:5173,https://code-sense-six.vercel.app
BACKEND_URL=http://localhost:5000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@example.com
```

Notes:

- `FRONTEND_URL` can be a comma-separated list of allowed origins.
- If `JWT_SECRET` is missing, the backend can generate one for the current session, but a fixed secret should be set in production.
- For Gmail SMTP, use an app password, not your main account password.

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

`VITE_SOCKET_URL` is optional in local development now because the app can derive it from `VITE_API_URL`, but setting it explicitly is still recommended for deployments.

## Local Development

### 1. Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs by default on `http://localhost:5000`.

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs by default on `http://localhost:5173`.

## Deployment

### Frontend on Vercel

Set these environment variables in Vercel:

```env
VITE_API_URL=https://code-sense-iynm.onrender.com/api
VITE_API_BASE_URL=https://code-sense-iynm.onrender.com/api
VITE_SOCKET_URL=https://code-sense-iynm.onrender.com
```

### Backend on Render

Set these environment variables in Render:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://code-sense-six.vercel.app
BACKEND_URL=https://code-sense-iynm.onrender.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@example.com
```

## Authentication Flow

1. User registers with name, email, and password.
2. Backend stores the user in MongoDB.
3. A verification email is sent using Nodemailer.
4. User verifies the account through the frontend verification route.
5. User logs in and receives a JWT.
6. Protected API routes use the JWT in the `Authorization` header.

## Collaboration Notes

- Real-time collaboration uses Socket.IO over the backend origin.
- Room metadata is stored in MongoDB.
- Live room state such as active users and in-memory code sync is managed by the socket server.

## Current Stack

- JWT for authentication
- MongoDB with Mongoose for persistence
- Nodemailer for email verification and password reset emails

## Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```
