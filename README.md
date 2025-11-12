# Full-Stack Authentication System

A production-ready authentication and role-based access control system built with **React**, **Express**, and **Supabase**.

## Features

- **Email/Password Authentication** with email verification
- **Google OAuth Login**
- **JWT-based Session Management**
- **Role-Based Access Control** (Admin & Customer)
- **Document Upload** with Cloudinary integration
- **Admin Dashboard** to view all users and documents
- **Customer Dashboard** for document management

## Tech Stack

### Frontend
- React.js 19
- React Router DOM
- Tailwind CSS 4
- React Hook Form + Zod
- Supabase Client

### Backend
- Express.js
- Prisma ORM
- Supabase (PostgreSQL + Auth)
- Cloudinary (File Storage)
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- Cloudinary account ([cloudinary.com](https://cloudinary.com))

### 1. Supabase Setup

1. Create a new project on Supabase
2. Go to **SQL Editor** and run the setup script:
   ```bash
   # Located at: backend/prisma/setup.sql
   ```
   This will create the `profiles` and `documents` tables with proper RLS policies.

3. Enable Google OAuth (optional):
   - Go to **Authentication > Providers**
   - Enable Google provider
   - Add your Google OAuth credentials

4. Disable email confirmation for development (optional):
   - Go to **Authentication > Settings**
   - Disable "Enable email confirmations"

5. Get your credentials:
   - Go to **Settings > API**
   - Copy `Project URL`, `anon public key`, and `service_role key`

### 2. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env and fill in your credentials:
```

Edit `backend/.env`:
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (from Supabase Settings > Database)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
# Generate Prisma client
npx prisma generate

# Start the server
npm run dev
```

The backend will run on `http://localhost:3000`

### 4. Frontend Setup

```bash
cd frontend/authentication

# Install dependencies
npm install

# Configure environment variables
# Edit .env:
```

Edit `frontend/authentication/.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

```bash
# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Application

1. Start the backend server (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend (Terminal 2):
   ```bash
   cd frontend/authentication
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Creating an Admin User

By default, all new users are created with the `customer` role. To create an admin user:

1. Sign up a new user through the UI
2. Go to Supabase dashboard → **Table Editor**
3. Open the `profiles` table
4. Find your user and change the `role` field from `customer` to `admin`
5. Refresh the app and log in again

## API Endpoints

### Authentication
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/create-profile` - Create user profile

### Documents (Customer)
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents/my-documents` - Get user's documents
- `DELETE /api/documents/:id` - Delete a document

### Admin
- `GET /api/admin/documents` - Get all documents
- `PATCH /api/admin/documents/:id/status` - Update document status
- `GET /api/admin/users` - Get all users

## Project Structure

```
Auth-project/
├── backend/
│   ├── config/          # Configuration files
│   ├── middleware/      # Auth & upload middleware
│   ├── routes/          # API routes
│   ├── prisma/          # Database schema & SQL
│   ├── .env            # Environment variables
│   └── index.js        # Express app entry
│
├── frontend/authentication/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── lib/         # Utilities & configs
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main app with routing
│   │   └── main.jsx     # React entry point
│   ├── .env            # Environment variables
│   └── vite.config.js  # Vite configuration
│
└── README.md           # This file
```

## Environment Variables Summary

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
PORT=3000
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3000
```

## Security Notes

- Never commit `.env` files to version control
- Use service role key only on the backend
- Enable RLS policies on Supabase tables
- Validate file types and sizes on both client and server
- Use HTTPS in production

## Troubleshooting

### "Email not confirmed" error
- Disable email confirmation in Supabase settings for development
- Or check your email inbox for the confirmation link

### Database connection errors
- Ensure DATABASE_URL is correctly formatted
- Check that your IP is allowed in Supabase (Settings > Database > Connection Pooling)

### File upload fails
- Verify Cloudinary credentials are correct
- Check file size (max 10MB)
- Ensure file type is PDF, PNG, or JPG

### CORS errors
- Ensure backend FRONTEND_URL matches your frontend port
- Check that backend is running

## License

MIT
