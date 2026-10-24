# Quality Issue Tracker (MEAN Stack)

A small full-stack web app for logging and tracking quality issues. Users register and log in, then create, view, edit, delete, search and filter issues by status and severity.

Built as a personal project to practise the MEAN stack (MongoDB, Express, Angular, Node.js) with JWT authentication.

## Features

- Register and log in with email and password (passwords hashed with bcrypt, sessions use JWT)
- Create, view, edit and delete issues
- Fields: title, description, severity (Low, Medium, High), status (Open, In Progress, Closed)
- Search by title or description, and filter by status and severity
- Status counts (Open, In Progress, Closed) shown above the list
- Form validation in the browser (Angular) and on the server (Mongoose)
- Protected pages: Angular route guard in the front end, JWT middleware in the API

## Tech stack

| Layer | Technology |
|---|---|
| Database | MongoDB with Mongoose |
| Back end | Node.js, Express, bcryptjs, jsonwebtoken, cors, dotenv |
| Front end | Angular (routing, reactive forms, HTTP interceptor, route guard), Bootstrap |

## How it works

```
Angular (localhost:4200)  --HTTP + JWT-->  Express API (localhost:3000)  -->  MongoDB
  pages, forms, guard,                      auth middleware, routes,           users and issues
  interceptor adds token                    validation, error handling         collections
```

1. The user logs in. The API checks the password hash and returns a signed JWT.
2. Angular stores the token. An HTTP interceptor adds `Authorization: Bearer <token>` to every request.
3. The Express auth middleware verifies the token before any `/api/issues` route runs.
4. A route guard in Angular redirects visitors who are not logged in to the login page.

## Project structure

```
quality-issue-tracker/
├── backend/
│   ├── models/          # User.js, Issue.js (Mongoose schemas)
│   ├── routes/          # auth.js, issues.js
│   ├── middleware/      # auth.js (JWT check), wrap.js (async error handling)
│   ├── server.js
│   └── .env.example
├── frontend/
│   └── src/app/
│       ├── services/        # auth and issue services
│       ├── interceptors/    # adds the JWT to requests
│       ├── guards/          # blocks pages when logged out
│       └── pages/           # login, register, issue list, issue form
└── README.md
```

## API endpoints

All `/api/issues` endpoints require the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account (email, password of at least 6 characters) |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/issues` | List issues. Optional query: `?status=`, `?severity=`, `?q=` (search) |
| GET | `/api/issues/stats` | Count of issues per status |
| GET | `/api/issues/:id` | Get one issue |
| POST | `/api/issues` | Create an issue |
| PUT | `/api/issues/:id` | Update an issue |
| DELETE | `/api/issues/:id` | Delete an issue |

## Data model

**User:** `email` (unique), `password` (bcrypt hash), `createdAt`, `updatedAt`

**Issue:** `title` (required), `description`, `severity` (Low, Medium, High), `status` (Open, In Progress, Closed), `createdBy` (reference to a user), `createdAt`, `updatedAt`

## Getting started

### Prerequisites

- Node.js (LTS)
- MongoDB running locally, or a free MongoDB Atlas cluster
- Angular CLI: `npm install -g @angular/cli`

To start MongoDB quickly with Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### Back end

```bash
cd backend
npm install
cp .env.example .env     # then edit JWT_SECRET
npm run dev
```

`.env` values:

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/issue_tracker
JWT_SECRET=use-a-long-random-string
```

You should see `MongoDB connected` in the terminal.

### Front end

```bash
cd frontend
npm install
ng serve
```

Open http://localhost:4200, register an account, and log in.

## Testing

The project is tested manually. The API can be checked with curl, Thunder Client or Postman. Quick check:

```bash
# register and log in
curl -X POST localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
curl -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# call a protected endpoint without a token (expect 401)
curl -i localhost:3000/api/issues
```

Checked cases include: missing or invalid token (401), invalid issue id (400), missing title (400), duplicate email (409), unknown issue id (404), search and filter combinations, and the front-end guard when logged out.

## Design notes

- **Passwords:** stored only as bcrypt hashes, never in plain text.
- **Token:** JWT signed with a secret from `.env`, expires after 2 hours.
- **Mass assignment:** create and update accept only `title`, `description`, `severity` and `status`, so clients cannot set `createdBy` or other fields.
- **Search:** the search text is escaped before being used in a regular expression, so special characters in the search box cannot break the query.
- **Errors:** validation errors return 400 with a message, and unexpected errors return a generic 500 without internal details.

## Limitations

- Token is stored in `localStorage`, which is simple but exposed to XSS. A production app would consider httpOnly cookies.
- Any logged-in user can edit or delete any issue (no roles or ownership checks).
- No pagination, so very long lists will load slowly.
- No automated tests yet.

## Future improvements

- Roles (admin and reporter) and ownership checks
- Pagination and sorting
- Automated tests (Jest and Supertest for the API)
- Docker Compose for the whole stack
- Connect an AI assistant so it can log issues through the API (for example from an MCP server)

