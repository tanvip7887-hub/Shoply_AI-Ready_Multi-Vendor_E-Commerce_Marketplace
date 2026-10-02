import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { verifyEmail } from "../store/slices/authSlice.js";
import { authApi } from "../api/auth.api.js";
import Button from "../components/ui/Button.jsx";

const VerifyEmailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get("email") || "";
  const isDeliveryAgent = queryParams.get("role") === "DELIVERY_AGENT";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Handle cooldown timer for resend code
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(verifyEmail({ email, otp: fullOtp }));
      if (verifyEmail.fulfilled.match(result)) {
        toast.success("Email verified successfully! Welcome to Shoply 🎉", {
          style: { background: "#10b981", color: "#fff" },
          iconTheme: { primary: "#fff", secondary: "#10b981" },
        });

        if (isDeliveryAgent) {
          navigate("/become-delivery-partner", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else if (verifyEmail.rejected.match(result)) {
        toast.error(result.payload?.message || "Invalid verification code");
      }
    } catch (err) {
      toast.error(err?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await authApi.resendEmailOtp({ email });
      toast.success(res.message || "Verification code sent successfully.", {
        style: { background: "#10b981", color: "#fff" },
      });
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex pt-12 justify-center bg-white">
      <div className="w-full max-w-[440px] bg-[#fde9f2] rounded-xl shadow-sm border border-pink-100 overflow-hidden flex flex-col mb-12 h-fit">
        <div className="p-8 pb-10">
          <div className="w-16 h-16 rounded-full bg-[#570D48]/10 text-[#570D48] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✉
          </div>

          <h2 className="text-[22px] font-bold text-[#570D48] mb-2 text-center">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            We've sent a 6-digit verification code to:
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-2.5 rounded-lg border border-pink-200 text-center font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#570D48]"
                required
              />
            </div>

            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-pink-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#570D48] focus:border-transparent shadow-sm"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <p className="text-xs text-center text-gray-500">
              Code expires in <span className="font-semibold text-gray-700">10 minutes</span>.
            </p>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full !py-3.5 !rounded-md text-[16px] font-semibold bg-[#570D48] hover:bg-[#4a0b3d] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Email
            </Button>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">Didn't receive the code? </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="text-sm font-semibold text-[#570D48] hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Code"}
            </button>
          </div>

          <div className="text-center mt-6">
            <Link to="/login" className="text-xs font-medium text-gray-500 hover:text-gray-700 underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
