import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/auth.api.js";
import Button from "../components/ui/Button.jsx";

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [isSending, setIsSending] = useState(false);

  if (!email) {
    // Direct visit without registering first — nothing to show.
    navigate("/register");
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authApi.resendVerificationPublic(email);
      toast.success("If your account isn't verified yet, a new email is on its way");
    } catch (err) {
      // interceptor toasts (e.g. rate-limit hit)
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📧</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        <p className="text-gray-600 text-sm mb-1">
          We've sent a verification email to your registered email address.
        </p>
        <p className="font-semibold text-gray-900 mb-4">{email}</p>
        <p className="text-gray-500 text-xs mb-6">
          Please verify your email before logging in.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={handleResend} isLoading={isSending}>
            Resend Verification Email
          </Button>
          <Link to="/login" className="text-brand-600 font-semibold text-sm hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;