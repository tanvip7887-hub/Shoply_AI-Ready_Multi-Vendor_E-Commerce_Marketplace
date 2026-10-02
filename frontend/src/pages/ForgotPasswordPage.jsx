import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth.api.js";
import { forgotPasswordSchema } from "../features/auth/auth.schema.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await authApi.resetPassword(data);
      toast.success("Password reset successfully");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      const msg = err.message || err.response?.data?.message || "Failed to reset password. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fde9f2] px-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Reset Password</h2>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Password Reset Successfully</h3>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been updated. Redirecting to Login...
            </p>
            <Link to="/login">
              <Button className="w-full bg-[#570D48] hover:bg-[#4a0b3d] text-white">
                Go to Login Now
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Enter your email address and new password below to reset your account password.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter registered email"
                {...register("email")}
                error={errors.email?.message}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min 8 chars)"
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full !py-3.5 !rounded-md text-[16px] font-semibold bg-[#570D48] hover:bg-[#4a0b3d] text-white mt-4"
              >
                Reset Password
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-[14px] font-semibold text-[#570D48] hover:underline">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
