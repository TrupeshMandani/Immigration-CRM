# Student Workflow Documentation

## Overview

The Immigration CRM system implements a comprehensive student onboarding and management workflow that combines contact form submission, admin activation, and student self-service features. This document explains the complete student journey from initial contact to active account usage.

## Complete Student Workflow

### Phase 1: Initial Contact & Registration

#### 1.1 Contact Form Submission

**Endpoint:** `POST /api/contact`
**Access:** Public (no authentication required)

**Process:**

- Potential student visits the landing page
- Fills out contact form with:
  - Full name
  - Email address
  - Phone number (optional)
  - Message/interest description
- System creates a "pending" student record

**Backend Response:**

```json
{
  "message": "Contact request submitted successfully",
  "contactId": "68f034ccec6bf320c2b7d442"
}
```

**Database State:**

- Student record created with `status: "pending"`
- `contactInfo` populated with form data
- `aiKey` auto-generated for future document processing
- `isFirstLogin: true` (will be used later)
- No username/password yet (not activated)

---

### Phase 2: Admin Review & Activation

#### 2.1 Admin Reviews Pending Contacts

**Endpoint:** `GET /api/students/pending/contacts`
**Access:** Admin only (requires JWT token)

**Process:**

- Admin logs in with admin credentials
- Views list of all pending contact requests
- Reviews student information and interest

**Admin Dashboard Shows:**

```json
[
  {
    "contactInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "message": "I am interested in immigration services..."
    },
    "_id": "68f034ccec6bf320c2b7d442",
    "aiKey": "contact-1760572620059-i1f06lrj0",
    "role": "student",
    "status": "pending",
    "isFirstLogin": true,
    "createdAt": "2025-10-15T23:57:00.068Z"
  }
]
```

#### 2.2 Admin Activates Student Account

**Endpoint:** `POST /api/students/:id/activate`
**Access:** Admin only (requires JWT token)

**Process:**

- Admin selects a pending student
- Creates login credentials:
  - Username (admin-defined)
  - Password (admin-defined)
- System updates student record

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "student123"
}
```

**Backend Processing:**

1. Validates student exists and is in "pending" status
2. Updates student record:
   - Sets `username` and `password` (hashed with bcrypt)
   - Changes `status` from "pending" to "active"
   - Sets `email` to contact email for login purposes
   - Keeps `isFirstLogin: true` for password change flow

**Response:**

```json
{
  "message": "Student account activated successfully",
  "student": {
    "id": "68f034ccec6bf320c2b7d442",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "contactInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "message": "I am interested in immigration services..."
    }
  }
}
```

---

### Phase 3: Student Login & First Access

#### 3.1 Student Login

**Endpoint:** `POST /api/auth/login`
**Access:** Public

**Process:**

- Student receives credentials from admin (via email/phone)
- Student visits login page
- Enters username OR email + password
- System authenticates and returns JWT token

**Login Options:**

- Username: `johndoe` + password
- Email: `john.doe@example.com` + password

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "student123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68f034ccec6bf320c2b7d442",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "role": "student",
    "aiKey": "contact-1760572620059-i1f06lrj0",
    "isFirstLogin": true
  }
}
```

#### 3.2 First Login Flow

**Frontend Logic:**

- If `isFirstLogin: true` → Redirect to password change page
- If `isFirstLogin: false` → Redirect to student dashboard

**Password Change Process:**

1. Student must change password on first login
2. System validates old password
3. Updates password and sets `isFirstLogin: false`
4. Redirects to dashboard

---

### Phase 4: Student Dashboard & Document Management

#### 4.1 Student Dashboard Access

**Features Available:**

- View personal profile information
- Upload documents for AI processing
- View AI-extracted profile data
- Access Google Drive documents
- Change password
- Update contact information

#### 4.2 Document Upload & AI Processing

**Endpoint:** `POST /api/upload`
**Access:** Student only (requires JWT token)

**Process:**

1. Student uploads documents (PDF, images, etc.)
2. System processes with AI to extract information
3. Creates/updates student profile with extracted data
4. Uploads files to Google Drive
5. Returns processed information

**Request:**

```bash
curl -X POST http://localhost:4000/api/upload \
  -F "files=@document.pdf" \
  -F "aiKey=contact-1760572620059-i1f06lrj0"
```

**Response:**

```json
{
  "message": "Successfully processed 1 files with AI and uploaded to Google Drive",
  "aiKey": "contact-1760572620059-i1f06lrj0",
  "driveFolder": "https://drive.google.com/drive/folders/...",
  "uploaded": [...],
  "student": {
    "profile": {
      "Name": "John Doe",
      "DateOfBirth": "1990-05-15",
      "UCI": "1234567890",
      "CountryOfOrigin": "India",
      "Language": "English",
      "TestDate": "2025-04-19",
      "OverallBandScore": "7.0"
    }
  }
}
```

---

## Database Schema Evolution

### Student Record States

#### 1. Pending State (After Contact Form)

```javascript
{
  _id: "68f034ccec6bf320c2b7d442",
  aiKey: "contact-1760572620059-i1f06lrj0",
  contactInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    message: "I am interested in immigration services..."
  },
  role: "student",
  status: "pending",
  isFirstLogin: true,
  // No username/password yet
  createdAt: "2025-10-15T23:57:00.068Z"
}
```

#### 2. Active State (After Admin Activation)

```javascript
{
  _id: "68f034ccec6bf320c2b7d442",
  aiKey: "contact-1760572620059-i1f06lrj0",
  username: "johndoe",
  email: "john.doe@example.com",
  password: "$2b$10$hashedpassword...",
  contactInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    message: "I am interested in immigration services..."
  },
  role: "student",
  status: "active",
  isFirstLogin: true,
  updatedAt: "2025-10-15T23:58:00.000Z"
}
```

#### 3. With AI Profile (After Document Processing)

```javascript
{
  _id: "68f034ccec6bf320c2b7d442",
  aiKey: "contact-1760572620059-i1f06lrj0",
  username: "johndoe",
  email: "john.doe@example.com",
  password: "$2b$10$hashedpassword...",
  contactInfo: { /* ... */ },
  profile: {
    Name: "John Doe",
    DateOfBirth: "1990-05-15",
    UCI: "1234567890",
    CountryOfOrigin: "India",
    Language: "English",
    TestDate: "2025-04-19",
    OverallBandScore: "7.0",
    ListeningScore: "7.0",
    ReadingScore: "7.0",
    WritingScore: "6.0",
    SpeakingScore: "7.0"
  },
  drive: {
    folderId: "1przwjvV-xgMyGZCG6HCRTV5uk9jhKHYV",
    webViewLink: "https://drive.google.com/drive/folders/..."
  },
  role: "student",
  status: "active",
  isFirstLogin: false, // After password change
  updatedAt: "2025-10-15T23:59:00.000Z"
}
```

---

## API Endpoints Summary

### Public Endpoints

- `POST /api/contact` - Submit contact form
- `POST /api/auth/login` - Login (admin or student)

### Admin-Only Endpoints

- `GET /api/students/pending/contacts` - View pending contacts
- `POST /api/students/:id/activate` - Activate student account
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Student-Only Endpoints

- `GET /api/students/:aiKey` - Get own profile
- `GET /api/students/:aiKey/files` - Get own documents
- `POST /api/upload` - Upload documents
- `POST /api/auth/change-password` - Change password

---

## Security Features

### Authentication

- JWT tokens for session management
- Password hashing with bcrypt
- Role-based access control
- Token expiration (7 days default)

### Data Protection

- Passwords never returned in API responses
- Sensitive data filtered from responses
- Secure file upload with validation
- Google Drive integration for document storage

### Access Control

- Admin-only routes protected by middleware
- Student can only access own data
- Pending students cannot login until activated
- First login requires password change

---

## Frontend Integration Points

### Landing Page

- Contact form for initial registration
- Public access, no authentication required

### Login Page

- Single form for both admin and student login
- Automatic role detection and redirection
- First login password change flow

### Student Dashboard

- Profile display with AI-extracted data
- Document upload interface
- Google Drive file browser
- Account management features

### Admin Dashboard

- Pending contacts management
- Student activation workflow
- Student list and management
- Document processing oversight

---

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials** - Wrong username/password
2. **Account Not Active** - Student not yet activated by admin
3. **Token Expired** - JWT token needs refresh
4. **Access Denied** - Insufficient permissions
5. **File Upload Errors** - Invalid file types or sizes

### Error Responses

```json
{
  "message": "Invalid credentials",
  "error": "AUTHENTICATION_FAILED"
}
```

---

## Testing the Complete Workflow

### 1. Test Contact Form

```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Student", "email": "test@example.com", "phone": "555-123-4567", "message": "Test message"}'
```

### 2. Test Admin Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin123123"}'
```

### 3. Test Student Activation

```bash
curl -X POST http://localhost:4000/api/students/{student_id}/activate \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"username": "teststudent", "password": "testpass123"}'
```

### 4. Test Student Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "teststudent", "password": "testpass123"}'
```

### 5. Test Document Upload

```bash
curl -X POST http://localhost:4000/api/upload \
  -H "Authorization: Bearer {student_token}" \
  -F "files=@document.pdf" \
  -F "aiKey={student_aiKey}"
```

---

## Benefits of This Workflow

### For Students

- Simple contact form to get started
- Secure account activation process
- Self-service document upload
- AI-powered profile extraction
- Easy access to all documents

### For Administrators

- Centralized contact management
- Controlled account activation
- Student progress tracking
- Document processing oversight
- Secure credential management

### For the System

- Scalable contact management
- Automated AI processing
- Secure file storage
- Role-based access control
- Comprehensive audit trail

This workflow provides a complete solution for managing immigration student applications from initial contact through document processing and ongoing account management.

