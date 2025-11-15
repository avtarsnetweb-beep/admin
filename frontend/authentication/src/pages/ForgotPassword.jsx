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


