import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { authApi } from "../../api/auth.api.js";

const UnverifiedBanner = () => {
    const { user } = useSelector((state) => state.auth);
    const [sending, setSending] = useState(false);

    if (!user || user.isEmailVerified) return null;

    const handleResend = async () => {
        setSending(true);
        try {
            await authApi.resendVerification();
            toast.success("Verification email sent");
        } catch (err) {
            // interceptor toasts
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex items-center justify-center gap-3">
            <span>Please verify your email address.</span>
            <button onClick={handleResend} disabled={sending} className="font-semibold underline">
                {sending ? "Sending..." : "Resend verification email"}
            </button>
        </div>
    );
};

export default UnverifiedBanner;