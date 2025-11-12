# 🔐 Full-Stack Authentication System (React + Express + Supabase)

## 🚀 Overview
A production-ready **authentication and role-based access control system** built using **React**, **Express**, and **Supabase**.  
Supports **email/password** and **Google login**, **email verification**, **JWT-based authentication**, **role-based routes** (Admin/Customer), and **document proof uploads** to **Cloudinary**.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js + React Router + Tailwind CSS + Shadcn UI |
| **Forms & Validation** | react-hook-form + zod |
| **Backend** | Express.js |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma (or Drizzle ORM) |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **Storage** | Cloudinary (for document uploads) |
| **Token** | Supabase JWT (included in Auth) |

---

## ✨ Features

### 🔑 Authentication
- Email/password signup & login  
- Google OAuth login  
- Email verification before login  
- JWT-based session management  
- Logout functionality  

### 👥 Roles & Permissions
- Two roles: **Admin** and **Customer**  
- Role stored in `profiles` table and token payload  
- Admin routes protected both frontend & backend  

### 🧾 Document Proof Upload
- Customers upload a document (PDF, PNG, or JPG)  
- File uploaded to **Cloudinary** via Express backend  
- Metadata stored in PostgreSQL (`documents` table)  
- Admin can view all uploaded documents with user details  

---

## 🗄️ Database Schema (PostgreSQL)

```sql
-- Profiles (linked to Supabase Auth user)
create table public.profiles (
  id uuid primary key,
  email text not null,
  full_name text,
  role text not null default 'customer',
  created_at timestamptz default now()
);

-- Documents uploaded by customers
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  file_url text not null,
  file_name text,
  file_type text,
  file_size bigint,
  uploaded_at timestamptz default now(),
  status text default 'pending'
);
