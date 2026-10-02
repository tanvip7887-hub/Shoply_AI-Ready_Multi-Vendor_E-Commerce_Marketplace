import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { login } from "../store/slices/authSlice.js";
import { loginSchema } from "../features/auth/auth.schema.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import sareeImg from "../assets/saree_login.webp";
import kurtiImg from "../assets/kurti_login.webp";

const roleHome = {
    CUSTOMER: "/",
    SELLER: "/seller/products",
    ADMIN: "/admin/dashboard",
    DELIVERY_AGENT: "/delivery/available",
};

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, status } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) });

    const queryParams = new URLSearchParams(location.search);
    const isDeliveryAgent = queryParams.get("role") === "DELIVERY_AGENT";

    useEffect(() => {
        if (isAuthenticated && user) {
            if (isDeliveryAgent && user.role === "CUSTOMER") {
                navigate("/become-delivery-partner", { replace: true });
            } else {
                const redirectTo = location.state?.from?.pathname || roleHome[user.role] || "/";
                navigate(redirectTo, { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, location, isDeliveryAgent]);

    const onSubmit = async (data) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const result = await dispatch(login(data));
            if (login.fulfilled.match(result)) {
                toast.success("Logged in successfully", {
                    style: {
                        background: '#10b981',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10b981',
                    },
                });
            } else if (login.rejected.match(result)) {
                const errMsg = result.payload?.message || "Invalid email or password";
                toast.error(errMsg);
                if (errMsg.toLowerCase().includes("verify your email")) {
                    navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex pt-12 justify-center bg-white">
            <div className="w-full max-w-[440px] bg-[#fde9f2] rounded-xl shadow-sm border border-pink-100 overflow-hidden flex flex-col mb-12 h-fit">
                <div className="p-8 pb-10">
                    <h2 className="text-[22px] font-bold text-[#570D48] mb-6">
                        Sign in to your account
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            type="email"
                            placeholder="Email Address"
                            {...register("email")}
                            error={errors.email?.message}
                        />

                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
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

                        <div className="text-right -mt-2">
                            <Link to="/forgot-password" className="text-[13px] font-semibold text-[#570D48] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button 
                            type="submit" 
                            isLoading={status === "loading" || isSubmitting} 
                            className="w-full !py-3.5 !rounded-md text-[16px] font-semibold bg-[#570D48] hover:bg-[#4a0b3d] text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <span className="text-[14px] text-gray-600">Don't have an account? </span>
                        <Link to="/register" className="text-[14px] font-semibold text-[#570D48] hover:underline">
                            Register
                        </Link>
                    </div>

                    <p className="text-center text-[12px] text-gray-500 mt-8">
                        By continuing, you agree to Meesho's{" "}
                        <span className="text-[#570D48] font-semibold cursor-pointer">Terms & Conditions</span>
                        <br />and <span className="text-[#570D48] font-semibold cursor-pointer">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;