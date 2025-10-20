# Immigration CRM

A comprehensive immigration business management system with AI-powered document processing.

## Features

- **AI Document Processing**: Upload documents and automatically extract important information
- **Student Management**: Complete student lifecycle management from contact to completion
- **Admin Dashboard**: Comprehensive admin interface for managing students and business operations
- **Student Portal**: Students can view their profile, documents, and track progress
- **Authentication**: Secure role-based authentication for admins and students

## Tech Stack

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Google Drive Integration
- OpenAI API for document processing
- bcrypt for password hashing

### Frontend

- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Context API for state management

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google Cloud Console project with Drive API enabled
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/immigration_crm
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key
DRIVE_PARENT_FOLDER_ID=your-drive-folder-id
```

4. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/api
```

4. Start the frontend development server:

```bash
npm run dev
```

## Usage

### First Time Setup

1. **Create Admin Account**: Visit the backend API endpoint to create the first admin account:

```bash
curl -X POST http://localhost:4000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123"}'
```

2. **Access the Application**: Open your browser and navigate to `http://localhost:5173`

### User Workflows

#### Admin Workflow

1. Login with admin credentials
2. View dashboard with student statistics
3. Manage students (view, create, activate, delete)
4. Process contact requests
5. Monitor business performance

#### Student Workflow

1. Admin creates student account and provides credentials
2. Student logs in with provided credentials
3. Student changes password on first login
4. Student views their profile and documents
5. Student can upload additional documents

#### Contact Workflow

1. Potential clients submit contact form
2. Admin reviews contact requests
3. Admin activates student accounts
4. Students receive login credentials
5. Students access their portal

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login for admin/student
- `POST /api/auth/register-admin` - Create first admin
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/profile` - Get user profile

### Contact

- `POST /api/contact` - Submit contact form

### Students

- `GET /api/students` - Get all students (admin only)
- `GET /api/students/pending/contacts` - Get pending contacts (admin only)
- `POST /api/students/:id/activate` - Activate student (admin only)
- `PUT /api/students/:id` - Update student (admin only)
- `DELETE /api/students/:id` - Delete student (admin only)
- `GET /api/students/:aiKey` - Get student by aiKey
- `GET /api/students/:aiKey/files` - Get student files

### Upload

- `POST /api/upload` - Upload documents for processing

## Project Structure

```
Immigration CRM/
├── backend/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── contact/     # Contact form
│   │   ├── students/    # Student management
│   │   ├── upload/      # File upload
│   │   └── extract/     # AI processing
│   ├── middleware/       # Custom middleware
│   └── routes/          # API routes
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── README.md
```

## Development

### Backend Development

- Uses nodemon for auto-restart
- MongoDB connection with Mongoose
- JWT middleware for authentication
- Error handling middleware

### Frontend Development

- Vite for fast development
- Hot module replacement
- Tailwind CSS for styling
- React Router for navigation

## Deployment

### Backend Deployment

1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure MongoDB Atlas for production
4. Set up proper JWT secrets

### Frontend Deployment

1. Build the production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for immigration business management.

