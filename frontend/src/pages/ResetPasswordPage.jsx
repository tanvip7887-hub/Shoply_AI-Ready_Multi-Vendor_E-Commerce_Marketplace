import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/auth.api.js";
import { resetPasswordSchema } from "../features/auth/auth.schema.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await authApi.resetPassword(token, { password: data.password });
      setIsSuccess(true);
      toast.success("Password reset successfully. You can now login.");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      const msg = err.message || "Failed to reset password. The link might be expired or invalid.";
      setErrorMessage(msg);
      // axios interceptor handles global error toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fde9f2] px-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Set New Password</h2>
        
        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <Link to="/login">
              <Button className="w-full bg-[#570D48] hover:bg-[#4a0b3d] text-white">
                Login Now
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-8 text-center">
              Please enter your new password below.
            </p>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                {...register("password")}
                error={errors.password?.message}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition-base"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition-base"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full !py-3.5 !rounded-md text-[16px] font-semibold bg-[#570D48] hover:bg-[#4a0b3d] text-white mt-2"
              >
                Reset Password
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-[14px] font-semibold text-[#570D48] hover:underline">
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
