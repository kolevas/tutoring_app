# Tutoring App

A full-stack tutoring appointment management system built with Vue.js, Node.js, Express, and MongoDB.

## Features

### For Students
- Browse available tutoring sessions
- Book sessions with tutors
- View and manage bookings
- User profile management

### For Tutors
- Create and manage tutoring sessions
- View student bookings
- Manage availability
- Track session history

### For Admins
- User management (assign roles)
- System-wide session management
- Analytics and reporting

## Tech Stack

### Frontend
- Vue.js 3 (JavaScript)
- Vuetify 3 (Material Design UI)
- Pinia (State Management)
- Vue Router
- Axios (HTTP Client)
- Vee-Validate (Form Validation)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (Password Hashing)
- CORS, Helmet (Security)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd tutoring_app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/tutoring_app
# JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Start MongoDB (if using local installation)
# On macOS with Homebrew:
brew services start mongodb-community

# Start the backend server
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on http://localhost:5173

### 4. Database Initialization

The application will automatically create the necessary collections when you first use it. You can create an admin user by:

1. Register a new user through the frontend
2. Manually update the user's role in MongoDB:

```javascript
// Connect to MongoDB
use tutoring_app

// Update user role to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Usage

1. **Registration**: Create an account by choosing your role (Student or Tutor)
2. **Login**: Sign in with your credentials
3. **Dashboard**: View role-specific dashboard with quick actions
4. **Sessions**: 
   - Students can browse and book available sessions
   - Tutors can create and manage their sessions
   - Admins can oversee all sessions
5. **Profile**: Update your profile information

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/tutors` - Get all tutors (Public)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Sessions
- `GET /api/sessions` - Get all sessions (with filters)
- `POST /api/sessions` - Create new session (Tutor/Admin)
- `GET /api/sessions/:id` - Get session by ID
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session (Tutor/Admin)
- `PUT /api/sessions/:id/book` - Book session (Student)
- `PUT /api/sessions/:id/cancel` - Cancel booking

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tutoring_app
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
tutoring_app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── sessions.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   ├── views/
    │   ├── stores/
    │   ├── services/
    │   ├── router/
    │   └── plugins/
    └── public/
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with hot reload
```

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `dist` folder to platforms like Netlify, Vercel, or your web server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
