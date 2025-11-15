import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { errorToast, successToast } from "../lib/toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [generatedOtp, setGeneratedOtp] = useState(""); // just for demo if needed

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      successToast("OTP sent to your email");
      setGeneratedOtp(data.otp);
      setStep(2);
    } catch (err) {
      errorToast(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (newPwd !== confirmPwd) {
      errorToast("Passwords do not match!");
      return;
    }

    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword: newPwd }),
      });

      successToast("Password Reset Successful!");
      navigate("/auth/login");
    } catch (err) {
      errorToast(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border p-2 rounded mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendOtp}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border p-2 rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-2 rounded mb-4"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-2 rounded mb-4"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />

            {/* ONLY FOR TESTING — Shows OTP */}
            <p className="text-red-500 text-sm">Dev OTP: {generatedOtp}</p>

            <button
              onClick={handleResetPassword}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../lib/api";
// import { errorToast, successToast } from "../lib/toast";

// // Email validation regex
// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [step, setStep] = useState(1);
//   const [otp, setOtp] = useState("");
//   const [newPwd, setNewPwd] = useState("");
//   const [confirmPwd, setConfirmPwd] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   // Validation helpers
//   const validateEmail = (email) => EMAIL_REGEX.test(email);
  
//   const validatePassword = (password) => {
//     if (password.length < 8) {
//       return "Password must be at least 8 characters";
//     }
//     if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
//       return "Password must contain uppercase, lowercase, and number";
//     }
//     return null;
//   };

//   const handleSendOtp = async () => {
//     // Validate email
//     if (!validateEmail(email)) {
//       errorToast("Please enter a valid email address");
//       return;
//     }

//     setLoading(true);
//     try {
//       await apiRequest("/api/auth/forgot-password", {
//         method: "POST",
//         body: JSON.stringify({ email }),
//       });

//       successToast("OTP sent to your email");
//       setStep(2);
//     } catch (err) {
//       errorToast(err.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResetPassword = async () => {
//     // Validate OTP
//     if (!otp || otp.trim().length === 0) {
//       errorToast("Please enter the OTP");
//       return;
//     }

//     // Validate passwords match
//     if (newPwd !== confirmPwd) {
//       errorToast("Passwords do not match!");
//       return;
//     }

//     // Validate password strength
//     const passwordError = validatePassword(newPwd);
//     if (passwordError) {
//       errorToast(passwordError);
//       return;
//     }

//     setLoading(true);
//     try {
//       await apiRequest("/api/auth/reset-password", {
//         method: "POST",
//         body: JSON.stringify({ email, otp, newPassword: newPwd }),
//       });

//       successToast("Password reset successful!");
//       navigate("/auth/login");
//     } catch (err) {
//       errorToast(err.message || "Failed to reset password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Enter key press
//   const handleKeyPress = (e, callback) => {
//     if (e.key === "Enter" && !loading) {
//       callback();
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
//       <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
//         {step === 1 && (
//           <>
//             <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
//             <p className="text-gray-600 text-sm mb-6">
//               Enter your email to receive a password reset code
//             </p>

//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-full border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyPress={(e) => handleKeyPress(e, handleSendOtp)}
//               disabled={loading}
//               autoComplete="email"
//             />

//             <button
//               onClick={handleSendOtp}
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//             >
//               {loading ? "Sending..." : "Send OTP"}
//             </button>

//             <button
//               onClick={() => navigate("/auth/login")}
//               className="w-full mt-3 text-blue-600 hover:underline text-sm"
//               disabled={loading}
//             >
//               Back to Login
//             </button>
//           </>
//         )}

//         {step === 2 && (
//           <>
//             <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
//             <p className="text-gray-600 text-sm mb-6">
//               Enter the OTP sent to {email}
//             </p>

//             <input
//               type="text"
//               placeholder="Enter OTP"
//               className="w-full border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               disabled={loading}
//               autoComplete="one-time-code"
//               maxLength={6}
//             />

//             <input
//               type="password"
//               placeholder="New Password"
//               className="w-full border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={newPwd}
//               onChange={(e) => setNewPwd(e.target.value)}
//               disabled={loading}
//               autoComplete="new-password"
//             />

//             <input
//               type="password"
//               placeholder="Confirm Password"
//               className="w-full border border-gray-300 p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={confirmPwd}
//               onChange={(e) => setConfirmPwd(e.target.value)}
//               onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
//               disabled={loading}
//               autoComplete="new-password"
//             />

//             <p className="text-xs text-gray-500 mb-4">
//               Password must be at least 8 characters with uppercase, lowercase, and number
//             </p>

//             <button
//               onClick={handleResetPassword}
//               disabled={loading}
//               className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//             >
//               {loading ? "Resetting..." : "Reset Password"}
//             </button>

//             <button
//               onClick={() => setStep(1)}
//               className="w-full mt-3 text-blue-600 hover:underline text-sm"
//               disabled={loading}
//             >
//               Back
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }