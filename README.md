# Smart Task Tracker

A comprehensive task management system built with Django REST Framework and React, featuring user authentication, project management, task tracking, and activity logging.

## Features

### Backend (Django + DRF)

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Contributor roles with admin key protection
- **Projects Management**: Create, update, delete projects (Admin only)
- **Task Management**: Full CRUD operations with status tracking
- **Activity Logging**: Track task changes with previous state
- **Soft Delete**: Safe deletion with recovery options
- **Filtering & Pagination**: Advanced filtering and pagination
- **Export Functionality**: Export tasks in JSON format

### Frontend (React)

- **Responsive Design**: Mobile-friendly interface
- **Authentication**: Login/Register with JWT tokens and admin key protection
- **Dashboard**: Overview with statistics and quick actions
- **Project Management**: View and manage projects
- **Task Management**: Create, update, and track tasks
- **Activity Logs**: View task change history (Admin only)
- **Real-time Updates**: Automatic data refresh

## Tech Stack

### Backend

- Django 4.2.7
- Django REST Framework 3.14.0
- Django REST Framework SimpleJWT 5.3.0
- PostgreSQL/SQLite
- Django CORS Headers
- Django Filter

### Frontend

- React 18.2.0
- TypeScript
- React Router DOM 6.14.1
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

## Installation & Setup

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shevilll/smart-task-tracker
   cd smart-task-tracker/backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables**
   Create a `.env` file in the backend directory:

   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   ADMIN_REGISTRATION_KEY=your-admin-key-here
   ```

5. **Run migrations**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**

   ```bash
   python manage.py createsuperuser
   ```

7. **Load sample data**

   ```bash
   python scripts/populate_data.py
   ```

8. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**
   Create a `.env` file in the frontend directory:

   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## Demo Credentials

### Admin User

- **Username**: admin
- **Password**: admin123

### Contributors

- **Username**: john_doe, **Password**: john123123
- **Username**: jane_smith, **Password**: jane123123

### Admin Registration

- **Admin Key**: admin-secret-2025 (for creating new admin accounts)

## Security Features

### Admin Registration Protection

- Admin accounts require a special registration key
- Default key: `admin-secret-2025` (change in production)
- Set via environment variable: `ADMIN_REGISTRATION_KEY`
- Prevents unauthorized admin account creation

## API Endpoints

### Authentication

- `POST /api/auth/register/` - User registration (requires admin key for admin role)
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Projects

- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project (Admin only)
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project (Admin only)
- `DELETE /api/projects/{id}/` - Delete project (Admin only)

### Tasks

- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task (Admin only)
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `PATCH /api/tasks/{id}/` - Partial update task
- `DELETE /api/tasks/{id}/` - Delete task (Admin only)
- `GET /api/tasks/export/` - Export tasks (Admin only)

### Activity Logs

- `GET /api/activity-logs/` - List activity logs (Admin only)

## User Roles & Permissions

### Admin

- Create, update, delete projects
- Create, update, delete tasks
- Assign tasks to contributors
- View all tasks and projects
- Access activity logs
- Export task data
- **Requires admin key for registration**

### Contributor

- View assigned tasks only
- Update task status
- View projects (read-only)
- Cannot create or delete tasks/projects
- **No special key required for registration**

## Key Features Explained

### Admin Registration Security

- Admin accounts require a special registration key
- Key is configurable via environment variables
- Prevents unauthorized privilege escalation
- Key is validated server-side during registration

### Activity Logging

- Tracks the last known state of each task before updates
- Stores previous assignee, status, and due date
- One log entry per task (updated on each change)
- Accessible only to admins

### Soft Delete

- Projects and tasks are marked as deleted instead of being removed
- Allows for data recovery and audit trails
- Filtered out from normal queries

### Export Functionality

- Exports tasks in JSON format
- Includes tasks due in next 48 hours
- Includes overdue tasks
- Includes recently completed tasks (last 24 hours)

### Filtering & Search

- Filter tasks by status, project, assignee
- Search tasks by title and description
- Pagination for large datasets
- Ordering by various fields

## Deployment

### Backend Deployment (Render/Heroku)

1. Update `settings.py` for production
2. Set environment variables (including `ADMIN_REGISTRATION_KEY`)
3. Configure database (PostgreSQL recommended)
4. Run migrations
5. Collect static files

### Frontend Deployment (Vercel/Netlify)

1. Build the React app: `npm run build`
2. Deploy the build folder
3. Set environment variables
4. Configure API URL

## Environment Variables

### Backend

- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `ADMIN_REGISTRATION_KEY`: Key required for admin registration
- `DATABASE_URL`: Database connection string (optional)

### Frontend

- `REACT_APP_API_URL`: Backend API URL

## Project Structure

```
smart-task-tracker/
├── backend/
│ ├── task_tracker/ # Django project settings
│ ├── accounts/ # User authentication app
│ ├── projects/ # Projects management app
│ ├── tasks/ # Tasks management app
│ ├── activity_logs/ # Activity logging app
│ ├── scripts/ # Utility scripts
│ └── requirements.txt
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── contexts/ # React contexts
│ │ ├── pages/ # Page components
│ │ ├── services/ # API services
│ │ └── App.tsx
│ └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
