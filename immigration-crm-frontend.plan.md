<!-- 848df4b1-93be-424e-9b92-b02e6f30f7d6 0931a910-f47b-48f5-831a-723c593db237 -->
# Immigration CRM Frontend Implementation

## Overview

Create a modern React frontend with authentication, landing page, and separate dashboards for students and admin users.

## Architecture

### Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, React Icons (as needed)
- **Routing**: React Router v6
- **State Management**: React Context API + localStorage
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form (optional, can use controlled components)

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── ChangePasswordForm.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── Loading.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── StudentProfile.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── StudentList.jsx
│   │       └── CreateStudent.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── utils/
│   │   └── ProtectedRoute.jsx
│   ├── App.jsx
│   └── main.jsx
```

## Backend Changes Required

### 1. Admin Model (`backend/models/Admin.js`)

Create new Admin model with:

- username (unique)
- email
- password (hashed with bcrypt)
- role: 'admin'
- timestamps

### 2. Student Model Updates (`backend/models/Student.js`)

Add authentication fields to existing Student model:

- username (unique, nullable initially)
- email
- password (hashed, nullable initially)
- role: 'student'
- isFirstLogin: boolean (default true)
- Keep existing: aiKey, profile, drive

### 3. Authentication Routes (`backend/modules/auth/`)

Create new auth module with:

- **POST /api/auth/login** - Login for both admin and student
  - Check username/email and password
  - Return JWT token + user data (role, id, aiKey if student)
- **POST /api/auth/change-password** - Change password (requires auth)
- **POST /api/auth/admin/register** - Register first admin (one-time setup)

### 4. Admin Student Management Routes

Update/add to student routes:

- **POST /api/students/create** - Admin creates student profile with temp credentials
  - Generate username/password
  - Send email with credentials (or return for manual sending)
- **PUT /api/students/:id** - Update student profile
- **DELETE /api/students/:id** - Delete student

### 5. Middleware (`backend/middleware/auth.js`)

- JWT verification middleware
- Role-based access control (admin-only routes)

### 6. Dependencies to Add

```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^6.9.7" // optional for email
}
```

## Frontend Implementation

### 1. Landing Page (`src/pages/Landing.jsx`)

- Hero section with CRM description
- Features section (document processing, AI extraction, etc.)
- Call-to-action buttons
- Navbar with "Login" button

### 2. Login System (`src/pages/Login.jsx`)

- Single login form for both admin and students
- Backend determines user type from credentials
- On success:
  - Store JWT token in localStorage
  - Redirect to appropriate dashboard based on role
  - If student.isFirstLogin → redirect to change password first

### 3. Student Dashboard

**Features:**

- View own profile (AI-extracted data from `student.profile`)
- View uploaded documents (from Google Drive)
- Update personal information
- Change password
- Logout

**Components:**

- `StudentDashboard.jsx` - Main layout
- `StudentProfile.jsx` - Display profile fields dynamically
- Profile card showing: name, DOB, UCI, passport, program, college, etc.

### 4. Admin Dashboard

**Features:**

- View all students list (GET /api/students)
- Search/filter students
- View individual student details
- Create new student accounts
- Upload documents for students
- Delete students
- Logout

**Components:**

- `AdminDashboard.jsx` - Main layout with stats
- `StudentList.jsx` - Table view of all students
- `CreateStudent.jsx` - Form to create new student + temp credentials

### 5. Authentication Context (`src/context/AuthContext.jsx`)

- Manage auth state globally
- Provide: user, token, login(), logout(), isAuthenticated
- Persist auth in localStorage
- Auto-logout on token expiry

### 6. Protected Routes

- Wrap dashboard routes with ProtectedRoute component
- Check authentication + role
- Redirect to login if not authenticated

### 7. API Service Layer (`src/services/`)

- Axios instance with interceptors
- Automatically attach JWT token to requests
- Handle 401 responses (auto-logout)
- API methods for all endpoints

## UI/UX Design

### Color Scheme

- Primary: Blue (#3B82F6)
- Secondary: Indigo (#6366F1)
- Success: Green (#10B981)
- Background: Gray-50
- Cards: White with shadow

### Key Pages Design

1. **Landing**: Modern hero, gradient background, feature cards
2. **Login**: Centered card, clean form, branding
3. **Student Dashboard**: Profile card + documents grid
4. **Admin Dashboard**: Stats cards + data table

## Environment Setup

### Frontend `.env`

```
VITE_API_URL=http://localhost:4000/api
```

### Backend `.env` additions

```
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
```

## Implementation Steps Summary

1. Set up React + Vite project with Tailwind
2. Create backend Admin model and auth routes
3. Update Student model with auth fields
4. Implement JWT middleware
5. Build frontend auth context and services
6. Create landing page and navbar
7. Build login page with form validation
8. Implement student dashboard with profile view
9. Implement admin dashboard with student management
10. Add protected routes and role-based access
11. Test complete auth flow (admin create → student login → change password)
12. Polish UI and add loading states

## Key Files to Create/Modify

**Backend:**

- `models/Admin.js` (new)
- `models/Student.js` (update)
- `modules/auth/auth.controller.js` (new)
- `modules/auth/auth.route.js` (new)
- `middleware/auth.js` (new)
- `modules/students/student.controller.js` (update)
- `modules/students/student.route.js` (update)

**Frontend:**

- All files in structure above (new)
- Root files: `package.json`, `vite.config.js`, `tailwind.config.js`, `index.html`

### To-dos

- [ ] Initialize React + Vite project with Tailwind CSS and install dependencies
- [ ] Create Admin model and update Student model with authentication fields
- [ ] Implement authentication system (JWT, bcrypt, login/register routes, middleware)
- [ ] Add admin endpoints for creating/managing students with credentials
- [ ] Set up frontend folder structure, routing, and auth context
- [ ] Build landing page with navbar and login navigation
- [ ] Create login page with form validation and role-based routing
- [ ] Build student dashboard with profile view and document access
- [ ] Build admin dashboard with student list, creation, and management features
- [ ] Add loading states, error handling, and polish UI/UX across all pages