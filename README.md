# 🎓 Admission System Documentation

## 🎯 Overview

The Admission System is a comprehensive web application designed to manage student admissions for educational institutions. It automates the entire admission process from candidate registration to final admission decisions, incorporating online examinations, O'Level result verification, and automated scoring calculations.

Built with **Next.js 15**, **TypeScript**, and **Prisma ORM**, the system provides separate portals for candidates and administrators, ensuring a streamlined and efficient admission workflow.

## 🏗️ Architecture

### **Technology Stack**

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite with Prisma schema
- **Authentication**: Custom JWT-based authentication
- **State Management**: React hooks, Zustand for client state
- **UI Components**: shadcn/ui component library with Lucide icons

### **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Candidate     │    │   Administrator │    │     Public       │
│    Portal       │    │     Portal      │    │     Pages       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Next.js API  │
                    │    Routes      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Prisma ORM    │
                    │                 │
                    │  SQLite Database│
                    └─────────────────┘
```

## 🔄 Methodology

### **Admission Process Flow**

1. **Candidate Registration**

   - Account creation with personal information
   - Academic details (UTME score, O'Level results)
   - Department selection

2. **Eligibility Check**

   - Automatic verification of UTME cutoff marks
   - O'Level aggregate validation
   - Department requirement compliance

3. **Online Examination**

   - Automated test assignment based on department
   - Timed online examinations with random questions
   - Immediate scoring and result storage

4. **Score Calculation**

   - **Exam Percentage**: (Candidate Score / Total Marks) × 100
   - **O'Level Percentage**: (O'Level Aggregate / 45) × 100
   - **Final Score**: (Exam% × Department Exam Weight) + (O'Level% × Department O'Level Weight)

5. **Admission Decision**
   - Automated status assignment based on final score
   - Admin review and override capabilities
   - Notification system for admission status

### **Scoring Methodology**

#### **O'Level Calculation**

```
O'Level Aggregate = Sum of marks from best 5 subjects
Maximum Possible = 45 marks (5 subjects × 9 marks each)
O'Level Percentage = (O'Level Aggregate / 45) × 100
```

#### **Examination Calculation**

```
Exam Percentage = (Total Score Obtained / Total Possible Marks) × 100
```

#### **Final Score Calculation**

```
Final Score = (Exam Percentage × Department Exam Weight) +
              (O'Level Percentage × Department O'Level Weight)

Where:
- Department Exam Weight + Department O'Level Weight = 100%
- Typical weights: Exam 70%, O'Level 30%
```

#### **Admission Status Logic**

- **NOT_ADMITTED**: No test attempts submitted
- **IN_PROGRESS**: Test(s) submitted but final score below department cutoff
- **ADMITTED**: Final score meets or exceeds department cutoff
- **REJECTED**: Submitted tests but doesn't meet minimum requirements

## ✨ Key Features

### **Candidate Portal**

- **Registration & Profile Management**

  - Personal information and academic details
  - Document upload and management
  - Real-time profile updates

- **Online Examination System**

  - Department-specific test assignments
  - Timed examinations with automatic submission
  - Real-time scoring and immediate feedback

- **Results & Admission Tracking**

  - Test performance analytics
  - Admission status monitoring
  - Eligibility requirement tracking

- **Dashboard**
  - Overview of admission progress
  - Important notifications and deadlines
  - Quick access to all features

### **Administrator Portal**

- **Dashboard & Analytics**

  - Real-time statistics and metrics
  - Admission progress tracking
  - System performance monitoring

- **Candidate Management**

  - Candidate search and filtering
  - Admission status management
  - Bulk operations and exports

- **Examination Management**

  - Question bank management
  - Test creation and scheduling
  - Automated scoring and grading

- **System Configuration**
  - Department management
  - Cutoff marks configuration
  - User access control

### **Public Portal**

- **Department Information**

  - Program details and requirements
  - Cutoff marks and eligibility criteria
  - Application guidelines

- **Statistics**
  - Public admission statistics
  - Department-wise admission rates
  - Historical data trends

## 🗃️ Database Schema Highlights

### **Core Entities**

#### **Candidate Model**

```sql
- id: String (Primary Key)
- userId: String (Foreign Key to User)
- fullName: String
- utmeScore: Integer
- olevelAggregate: Integer
- olevelPercentage: Integer (Calculated)
- examPercentage: Integer (Calculated)
- finalScore: Integer (Calculated)
- admissionStatus: Enum (NOT_ADMITTED, IN_PROGRESS, ADMITTED, REJECTED)
- departmentId: String (Foreign Key)
- stateId: String (Foreign Key)
- lgaId: String (Foreign Key)
```

#### **Department Model**

```sql
- id: String (Primary Key)
- name: String
- code: String
- examPercentage: Integer (Default: 70)
- olevelPercentage: Integer (Default: 30)
- finalCutoffMark: Integer
- utmeCutoffMark: Integer
- olevelCutoffAggregate: Integer
- status: Enum (ACTIVE, INACTIVE)
```

#### **Examination Model**

```sql
- id: String (Primary Key)
- title: String
- description: String
- duration: Integer (minutes)
- totalMarks: Integer
- passingMarks: Integer
- departmentId: String (Foreign Key)
- isActive: Boolean
```

#### **Question Model**

```sql
- id: String (Primary Key)
- content: String
- options: String (JSON array)
- correctAnswer: Integer
- marks: Integer
- difficulty: Integer (1-5 scale)
- departmentId: String (Foreign Key)
- subjectId: String (Foreign Key)
```

### **Supporting Entities**

#### **User Authentication**

```sql
- User: id, email, password, role (CANDIDATE, ADMIN)
- Candidate: Links to User
- Admin: Links to User
```

#### **Academic Records**

```sql
- Subject: O'Level subjects (Mathematics, English, etc.)
- GradingRule: Grade to marks mapping (A1=9, B2=8, etc.)
- OLevelResult: Candidate's O'Level results
- TestAttempt: Candidate's examination attempts
- TestAnswer: Specific answers to questions
```

#### **Geographic Data**

```sql
- State: Nigerian states
- Lga: Local Government Areas within states
```

### **Relationships**

```
User 1:1 Candidate
User 1:1 Admin
Department 1:M Candidate
Department 1:M Examination
Department 1:M Question
Subject 1:M Question
Examination 1:M TestAttempt
Candidate 1:M TestAttempt
TestAttempt 1:M TestAnswer
Question 1:M TestAnswer
Candidate 1:M OLevelResult
Subject 1:M OLevelResult
GradingRule 1:M OLevelResult
State 1:M Candidate
State 1:M Lga
Lga 1:M Candidate
```

## 🔧 Key API Endpoints

### **Candidate APIs**

- `POST /api/auth/register` - Candidate registration
- `POST /api/auth/login` - Candidate login
- `GET /api/candidate/profile` - Get candidate profile
- `PUT /api/candidate/profile` - Update candidate profile
- `GET /api/candidate/tests` - Get assigned tests
- `POST /api/candidate/tests/[id]/start` - Start a test
- `GET /api/candidate/tests/[id]/questions` - Get test questions
- `POST /api/candidate/tests/[id]/submit` - Submit test answers
- `POST /api/candidate/calculate-final-score` - Calculate final score

### **Administrator APIs**

- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/candidates` - Get all candidates
- `GET /api/admin/candidates/[id]` - Get specific candidate
- `PUT /api/admin/candidates` - Update candidate admission status
- `GET /api/admin/questions` - Get all questions
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/[id]` - Update question
- `DELETE /api/admin/questions/[id]` - Delete question
- `GET /api/admin/examinations` - Get all examinations
- `POST /api/admin/examinations` - Create examination
- `GET /api/admin/departments` - Get all departments

### **Public APIs**

- `GET /api/public/departments` - Get department list
- `GET /api/public/department-requirements` - Get department requirements
- `GET /api/public/stats` - Get public statistics

## 🚀 Deployment

### **Development Setup**

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### **Production Build**

```bash
# Build application
npm run build

# Start production server
npm start
```

### **Environment Variables**

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔐 Security Features

- **JWT-based authentication** with secure token handling
- **Role-based access control** (Candidate vs Admin)
- **Input validation** using Zod schemas
- **SQL injection prevention** through Prisma ORM
- **XSS protection** through Next.js built-in security
- **Rate limiting** on API endpoints
- **Secure password hashing** with bcrypt

## 📊 Monitoring & Logging\*\*

- **Comprehensive logging** for all API operations
- **Error tracking** with detailed error messages
- **Performance monitoring** for database queries
- **User activity tracking** for audit purposes
- **System health monitoring** with automatic alerts

## 🔄 Data Flow

1. **Candidate Registration** → Database storage
2. **Test Assignment** → Automatic based on department
3. **Test Taking** → Real-time answer storage
4. **Test Submission** → Automatic scoring and final calculation
5. **Admission Decision** → Automated + Admin review
6. **Notification** → Status update communication

## 📋 Final Score Saving Process

### **When Final Scores Are Saved to Database**

The final scores are saved to the database at the following trigger points:

1. **After Test Submission** (Primary Trigger)

   - When a candidate submits a test via `/api/candidate/tests/[id]/submit/route.ts`
   - This automatically calls `/api/candidate/calculate-final-score/route.ts`
   - The calculation API saves: `olevelAggregate`, `olevelPercentage`, `examPercentage`, `finalScore`, `admissionStatus`

2. **Manual Recalculation** (Secondary Trigger)

   - When an admin updates candidate admission status via `/api/admin/candidates/route.ts`
   - When candidate profile is updated (if it triggers score recalculation)

3. **Initial Candidate Creation** (Limited)
   - When candidate first registers, but only has basic data (no test attempts yet)

### **What Happens to Candidates Without Saved Final Scores**

For candidates whose final scores didn't save to database:

1. **Database Values**: `olevelPercentage`, `examPercentage`, `finalScore` will be `null` or `0`
2. **Fallback Behavior**:

   - **Admin Pages**: Will show `0` or default values (we added fallback logic)
   - **Candidate Profile**: Will recalculate on-the-fly using correct formula
   - **Candidate Results**: Uses admission recommendation API (always calculates fresh)

3. **Automatic Recovery**:

   - Next time the candidate submits any test, scores will be calculated and saved
   - Admin can manually trigger recalculation by updating admission status
   - System still functions correctly, just without persistent cached scores

4. **Impact**:
   - **Minor**: Pages might be slightly slower (need to recalculate)
   - **Minor**: Inconsistent scores across different pages
   - **No Critical Failure**: All calculations still work correctly

## 🎯 Why This System?

- **🏎️ Automated Admission Process** - Reduces manual work and human error
- **🎨 User-Friendly Interface** - Intuitive design for both candidates and administrators
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Secure** - JWT-based authentication with role-based access control
- **📊 Comprehensive Analytics** - Real-time statistics and performance tracking
- **🚀 Production Ready** - Optimized build and deployment settings

This system provides a complete, automated admission solution that reduces manual work while maintaining accuracy and fairness in the admission process.

---

Built with ❤️ for educational institutions by codewithemperor. Powered by modern web technologies. 🚀
