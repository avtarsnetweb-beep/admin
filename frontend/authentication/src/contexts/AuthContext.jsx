import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { apiRequest } from '../lib/api';
import axios from "axios";

const AuthContext = createContext({});


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        loadProfile();
      } else {
        setLoading(false);
      }
    });


    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        loadProfile();
      } else {
        localStorage.removeItem('access_token');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await apiRequest('/api/auth/profile');
      console.log("profiledata",profileData);
      
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;

    // Create profile in backend
    if (data.user && data.session) {
      try {
        await apiRequest('/api/auth/create-profile', {
          method: 'POST',
          body: JSON.stringify({ fullName })
        });
      } catch (err) {
        console.error('Failed to create profile:', err);
      }
    }

    return data;
  };
//abc
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    localStorage.removeItem('access_token');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin: profile?.role === 'admin',
    isCustomer: profile?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useNavigate } from "react-router-dom";
// import { errorToast } from "../lib/toast";

// export default function AuthCallback() {
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const handleSession = async () => {
//       try {
//         const {
//           data: { session },
//           error: sessionError,
//         } = await supabase.auth.getSession();

//         if (sessionError) {
//           throw sessionError;
//         }

//         if (session?.access_token) {
//           localStorage.setItem("access_token", session.access_token);
//           navigate("/dashboard", { replace: true });
//         } else {
//           throw new Error("No session found");
//         }
//       } catch (err) {
//         console.error("Auth callback error:", err);
//         setError(err.message || "Authentication failed");
//         errorToast("Authentication failed. Please try logging in again.");
        
//         // Redirect to login after a short delay
//         setTimeout(() => {
//           navigate("/auth/login", { replace: true });
//         }, 2000);
//       }
//     };

//     handleSession();
//   }, [navigate]);

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
//           <div className="text-red-500 text-4xl mb-4">⚠️</div>
//           <h2 className="text-xl font-bold text-gray-900 mb-2">
//             Authentication Failed
//           </h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <p className="text-sm text-gray-500">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-md text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//         <p className="text-gray-700 font-medium">Logging you in...</p>
//         <p className="text-sm text-gray-500 mt-2">Please wait</p>
//       </div>
//     </div>
//   );
// }