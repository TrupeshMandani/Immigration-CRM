<!-- 848df4b1-93be-424e-9b92-b02e6f30f7d6 c47269ef-ed8b-4be3-827c-6a88abf475ba -->
# Immigration CRM - Phase 2 Implementation Plan

## Architecture Foundation (Scalability)

### Multi-tenant Ready Database Structure

Update models to support future multi-tenant architecture while keeping current single-agency simplicity:

**backend/models/Agency.js** (NEW)

- Schema: name, slug, settings, branding, subscription, status
- Prepare for future: Each student/application will reference agencyId
- Current: Create default agency on first setup

**backend/models/Admin.js** (UPDATE)

- Add: agencyId (optional, defaults to main agency)
- Add: permissions array for role-based access
- Roles: Super Admin, Manager, Agent, Document Verifier

## PHASE 1: Application/Case Management System

### 1.1 Application Model & Visa Types

**backend/models/Application.js** (NEW)

```javascript
{
  studentId: ObjectId ref Student,
  agencyId: ObjectId (for future),
  visaType: String enum [
    'study_permit', 'work_permit', 'pr_express_entry', 
    'pr_pnp', 'visitor_visa', 'lmia', 'pgwp', 'spousal_sponsorship'
  ],
  country: String default 'Canada',
  status: String enum [
    'draft', 'documents_pending', 'documents_complete', 
    'submitted', 'in_process', 'approved', 'rejected', 'closed'
  ],
  priority: String enum ['low', 'medium', 'high', 'urgent'],
  
  // Timeline tracking
  createdAt, updatedAt, submittedAt, completedAt, decisionDate,
  
  // Case details
  applicationNumber: String (e.g., "APP-2025-0001"),
  uciNumber: String,
  fileNumber: String,
  
  // Progress
  completionPercentage: Number,
  currentStep: String,
  
  // Assignments
  assignedTo: ObjectId ref Admin,
  
  // Internal notes
  notes: [{ text, createdBy, createdAt }],
  
  // Links
  documents: [ObjectId ref Document],
  tasks: [ObjectId ref Task],
  timeline: [{ event, date, description, createdBy }]
}
```

**backend/models/VisaTypeTemplate.js** (NEW)

- Pre-defined checklist, required docs, and workflow stages per visa type
- Canada-specific templates: Study Permit requirements, Express Entry stages, etc.

### 1.2 Application Endpoints

**backend/modules/applications/application.controller.js** (NEW)

- Create application for student
- Update application status with timeline logging
- Assign application to agent
- Get all applications (with filters: status, visa type, agent, date range)
- Get student's applications
- Delete/archive application
- Duplicate application (for resubmissions)

**backend/modules/applications/application.route.js** (NEW)

Routes:

- POST /applications - Create new application
- GET /applications - List all (admin, with filters)
- GET /applications/:id - Get single application
- PUT /applications/:id - Update application
- PUT /applications/:id/status - Update status (logs to timeline)
- PUT /applications/:id/assign - Assign to agent
- DELETE /applications/:id - Delete application
- GET /students/:studentId/applications - Student's applications

### 1.3 Frontend - Application Management

**frontend/src/pages/admin/Applications.jsx** (NEW)

- List view with filters (status, visa type, agent, date)
- Kanban board view by status
- Quick stats: Total, Pending Docs, In Process, Approved
- Bulk actions: Assign, Update status
- Search by student name, application number

**frontend/src/pages/admin/ApplicationDetail.jsx** (NEW)

- Full application details
- Status timeline visualization
- Document checklist with status
- Task list
- Internal notes section
- Quick actions: Change status, Assign agent, Add note

**frontend/src/pages/student/StudentApplications.jsx** (NEW)

- Student view of their applications
- Progress bars and status indicators
- Can view but not edit status
- Can add notes/messages to admin

## PHASE 2: Enhanced Document Management

### 2.1 Document Categorization & Tracking

**backend/models/Document.js** (NEW)

```javascript
{
  studentId: ObjectId ref Student,
  applicationId: ObjectId ref Application (optional),
  category: String enum [
    'passport', 'education', 'language_test', 'work_experience',
    'financial', 'medical', 'police_clearance', 'birth_certificate',
    'marriage_certificate', 'reference_letter', 'job_offer', 'other'
  ],
  
  // S3 storage
  s3Key: String,
  s3Bucket: String,
  
  // Metadata
  fileName: String,
  originalName: String,
  mimeType: String,
  size: Number,
  
  // Document details
  documentType: String, // "IELTS Result", "Passport", "Degree Certificate"
  issueDate: Date,
  expiryDate: Date,
  issuingAuthority: String,
  
  // Status & verification
  status: String enum ['pending', 'verified', 'rejected', 'expired'],
  verifiedBy: ObjectId ref Admin,
  verifiedAt: Date,
  rejectionReason: String,
  
  // AI extracted data
  extractedData: Mixed,
  
  // Versions (for resubmissions)
  version: Number,
  previousVersion: ObjectId ref Document,
  
  uploadedAt: Date,
  tags: [String]
}
```

### 2.2 Document Checklist System

**backend/modules/documents/checklist.service.js** (NEW)

- Generate required document list based on visa type
- Track which documents are uploaded, verified, missing
- Return checklist with status for each required document
- Alert on missing critical documents

**backend/modules/documents/document.controller.js** (NEW)

- Upload with category selection
- Update document metadata (expiry, issue date)
- Verify/reject document (admin only)
- Get documents by category, application, status
- Document expiry alerts (30 days, 7 days)

### 2.3 Frontend - Document Management

**frontend/src/components/documents/DocumentChecklist.jsx** (NEW)

- Visual checklist grouped by category
- Status indicators: ✓ Verified, ⏳ Pending, ✗ Missing, ⚠ Expiring Soon
- Upload directly from checklist
- Admin: Verify/reject buttons

**frontend/src/components/documents/DocumentUploadModal.jsx** (NEW)

- Category selection dropdown
- Document type selection (based on category)
- Optional: Issue date, expiry date, issuing authority
- Drag-and-drop + file browser
- Preview before upload

**frontend/src/pages/admin/DocumentReview.jsx** (NEW)

- Queue of documents pending verification
- Side-by-side viewer and form
- Quick actions: Verify, Reject, Request replacement
- Bulk verify option

## PHASE 3: Communication System

### 3.1 Internal Messaging

**backend/models/Message.js** (NEW)

```javascript
{
  applicationId: ObjectId ref Application,
  studentId: ObjectId ref Student,
  senderId: ObjectId (Student or Admin),
  senderRole: String enum ['student', 'admin'],
  
  message: String,
  attachments: [{ s3Key, fileName, mimeType }],
  
  isRead: Boolean,
  readAt: Date,
  
  // Threading
  parentMessageId: ObjectId ref Message,
  
  createdAt: Date
}
```

**backend/modules/messages/message.controller.js** (NEW)

- Send message (student ↔ admin)
- Get conversation thread
- Mark as read
- Get unread count
- Attach files to messages

### 3.2 Email Notifications

**backend/modules/notifications/email.service.js** (NEW)

Email templates for:

- New message received
- Document uploaded by student
- Document verified/rejected
- Application status changed
- Document expiring soon (30 days, 7 days)
- Task assigned
- Payment reminder

**backend/utils/emailTemplates.js** (NEW)

- HTML email templates with branding
- Variables: {studentName}, {applicationNumber}, {dueDate}, etc.

### 3.3 Frontend - Communication

**frontend/src/components/messaging/MessageThread.jsx** (NEW)

- WhatsApp-style message interface
- Real-time updates (polling or websockets later)
- File attachments with preview
- Typing indicators
- Read receipts

**frontend/src/components/messaging/MessageNotifications.jsx** (NEW)

- Notification bell icon with unread count
- Dropdown with recent messages
- Link to full conversation

## PHASE 4: Task & Checklist Management

### 4.1 Task System

**backend/models/Task.js** (NEW)

```javascript
{
  applicationId: ObjectId ref Application,
  studentId: ObjectId ref Student,
  
  title: String,
  description: String,
  
  assignedTo: ObjectId (Student or Admin),
  assignedRole: String enum ['student', 'admin'],
  
  dueDate: Date,
  priority: String enum ['low', 'medium', 'high'],
  
  status: String enum ['pending', 'in_progress', 'completed', 'cancelled'],
  
  // Task type
  taskType: String enum ['document_upload', 'payment', 'form_submission', 'appointment', 'general'],
  
  // Links
  relatedDocumentId: ObjectId,
  
  completedAt: Date,
  completedBy: ObjectId,
  
  createdBy: ObjectId ref Admin,
  createdAt: Date
}
```

**backend/modules/tasks/task.service.js** (NEW)

- Auto-generate tasks when application created (based on visa template)
- Create custom task
- Assign task
- Complete task (with verification)
- Task reminders (due in 3 days, overdue)

### 4.2 Frontend - Task Management

**frontend/src/components/tasks/TaskList.jsx** (NEW)

- Filterable task list (My Tasks, All Tasks, By Application)
- Status indicators and due date highlighting
- Quick complete checkbox
- Sort by priority, due date, status

**frontend/src/components/tasks/TaskCard.jsx** (NEW)

- Expandable task details
- Comments/notes on task
- Attach files to task
- Mark complete with confirmation

## PHASE 5: AI-Powered Features

### 5.1 Document Validation AI

**backend/modules/ai/document-validator.service.js** (NEW)

Using OpenAI Vision API:

- Check if document is expired (extract expiry date)
- Validate document completeness (all pages, clear text)
- Extract key information (passport number, test scores, dates)
- Fraud detection (image manipulation, fake documents)
- Return validation score and issues found

### 5.2 Eligibility Checker (Canada Focus)

**backend/modules/ai/eligibility.service.js** (NEW)

- CRS Score Calculator for Express Entry
- Study permit eligibility checker
- Work permit eligibility checker
- Input: Student profile + documents
- Output: Eligible programs, CRS score, recommendations, missing requirements

**frontend/src/pages/student/EligibilityCheck.jsx** (NEW)

- Step-by-step questionnaire
- Real-time eligibility results
- Recommended visa programs
- What documents are needed
- CRS score breakdown with improvement suggestions

### 5.3 Smart Form Auto-Fill

**backend/modules/ai/form-autofill.service.js** (NEW)

- Extract data from all uploaded documents
- Consolidate into structured profile
- Pre-fill government form fields
- Export as PDF or JSON for form completion

## PHASE 6: Payment & Invoice Management

### 6.1 Payment Tracking

**backend/models/Payment.js** (NEW)

```javascript
{
  studentId: ObjectId ref Student,
  applicationId: ObjectId ref Application,
  
  invoiceNumber: String,
  
  description: String,
  amount: Number,
  currency: String default 'CAD',
  
  status: String enum ['pending', 'paid', 'partial', 'overdue', 'cancelled'],
  
  dueDate: Date,
  paidAt: Date,
  
  paymentMethod: String,
  transactionId: String,
  
  createdBy: ObjectId ref Admin,
  createdAt: Date
}
```

**backend/modules/payments/payment.controller.js** (NEW)

- Create invoice
- Record payment
- Send payment reminder
- Generate receipt PDF
- Payment history

### 6.2 Frontend - Payments

**frontend/src/pages/admin/Invoices.jsx** (NEW)

- Invoice list with filters
- Quick create invoice
- Send reminder button
- Payment status tracking

**frontend/src/pages/student/StudentPayments.jsx** (NEW)

- View invoices
- Payment history
- Download receipts
- (Future: Online payment integration)

## PHASE 7: Analytics & Reporting

### 7.1 Dashboard Analytics

**backend/modules/analytics/analytics.service.js** (NEW)

Calculate:

- Total applications by status
- Success rate per visa type
- Average processing time
- Revenue this month/year
- Documents pending verification
- Overdue tasks
- Agent performance metrics

**frontend/src/pages/admin/AdminDashboard.jsx** (UPDATE)

Add analytics widgets:

- Application pipeline chart
- Recent activities
- Upcoming deadlines
- Revenue overview
- Quick actions

### 7.2 Reports

**backend/modules/reports/report.controller.js** (NEW)

Generate reports:

- Monthly business summary (PDF/CSV)
- Student application history
- Document verification report
- Payment report
- Agent productivity report

## Implementation Database Changes

**Student Model Updates** (backend/models/Student.js)

- Add: applications: [ObjectId ref Application]
- Add: messages: [ObjectId ref Message]
- Add: tasks: [ObjectId ref Task]

**Admin Model Updates** (backend/models/Admin.js)

- Add: permissions: [String]
- Add: agencyId: ObjectId (prepare for multi-tenant)

## Technology Additions

**Backend Dependencies:**

- pdf-lib (for PDF generation - invoices, receipts)
- node-cron (for scheduled tasks - reminders, expiry alerts)
- nodemailer (already may have, for email notifications)

**Frontend Dependencies:**

- recharts (for analytics charts)
- react-big-calendar (for appointment scheduling - future)
- react-beautiful-dnd (for Kanban board drag-and-drop)

## Security & Permissions

**Middleware Updates:**

- Role-based access control (RBAC)
- Permission checking middleware
- Activity logging for audit trail

## Testing Strategy

Each phase includes:

- API endpoint tests
- Integration tests for workflows
- Frontend component tests
- End-to-end user flow tests

## Deployment Considerations

**Scalability Prep:**

- Database indexes on frequently queried fields
- Pagination for all list endpoints
- Caching for dashboard analytics
- Background jobs for email sending
- File upload size limits and validation

**Future Multi-tenant:**

- All queries will filter by agencyId
- Agency-specific branding/settings
- Separate S3 folders per agency
- Agency subscription management

### To-dos

- [ ] Create Application, VisaTypeTemplate models with Canada-specific visa types and multi-tenant ready structure
- [ ] Build application management API endpoints (CRUD, status updates, assignment, filters)
- [ ] Create admin Applications page with list/kanban views and ApplicationDetail page with timeline
- [ ] Create Document model with categories, expiry tracking, verification status, and version history
- [ ] Build document checklist system that auto-generates required docs based on visa type
- [ ] Create DocumentChecklist, DocumentUploadModal, and DocumentReview components
- [ ] Build messaging system (Message model, API, real-time communication between student and admin)
- [ ] Implement email notification service with templates for status changes, document alerts, messages
- [ ] Create MessageThread and MessageNotifications components for in-app communication
- [ ] Build task management system (Task model, auto-generation from templates, assignments, reminders)
- [ ] Create TaskList and TaskCard components with filtering, completion tracking, and due date alerts
- [ ] Implement AI document validation (expiry check, completeness, fraud detection using OpenAI Vision)
- [ ] Build Canada-focused eligibility checker (CRS calculator, program recommendations, requirements)
- [ ] Create AI form auto-fill service to extract and consolidate data from all documents
- [ ] Build payment/invoice system (Payment model, invoice generation, payment tracking, receipt PDFs)
- [ ] Create invoice management and payment history pages for admin and student
- [ ] Implement analytics service (application stats, success rates, revenue, agent performance)
- [ ] Update AdminDashboard with analytics widgets, charts, and key metrics
- [ ] Build report generation system (monthly summaries, application history, document reports as PDF/CSV)