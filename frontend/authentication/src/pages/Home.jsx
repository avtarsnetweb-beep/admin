import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";

export function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Auth System</h1>
            <div className="space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Full-Stack Authentication System
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            A production-ready authentication and role-based access control
            system built with React, Express, and Supabase.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {!user && (
              <>
                <Link to="/auth/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 text-3xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold mb-2">
                Secure Authentication
              </h3>
              <p className="text-gray-600">
                Email/password and Google OAuth login with email verification
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Admin and Customer roles with protected routes and permissions
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 text-3xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
              <p className="text-gray-600">
                Secure document storage with Cloudinary integration
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
