import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [generatedOtp, setGeneratedOtp] = useState(""); // just for demo if needed

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("OTP sent to your email!");
      setGeneratedOtp(data.otp); // remove this in production
      setStep(2);
    } else {
      alert(data.error);
    }
  };

  const handleResetPassword = async () => {
    if (newPwd !== confirmPwd) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword: newPwd }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Password Reset Successful!");
      navigate("/auth/login");
    } else {
      alert(data.error);
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
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
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
