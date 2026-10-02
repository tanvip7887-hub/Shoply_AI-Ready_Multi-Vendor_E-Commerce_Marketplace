import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Truck, CheckCircle, Hourglass, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

const steps = [
    { num: 1, title: "Create Account", body: "Register or sign in with your Shoply user account." },
    { num: 2, title: "Submit Application", body: "Fill in your phone number, vehicle type, and preferred operating city." },
    { num: 3, title: "Admin Review", body: "Our admin team reviews and approves your Delivery Partner application." },
    { num: 4, title: "Account Upgrade", body: "Upon approval, your account role becomes DELIVERY_AGENT automatically." },
    { num: 5, title: "Start Delivering", body: "Log in and access your dedicated Delivery Portal to claim and fulfill pickups." },
];

const BecomeDeliveryPartnerPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [application, setApplication] = useState(null);
    const [loadingApp, setLoadingApp] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReapplying, setIsReapplying] = useState(false);

    // Form inputs
    const [phone, setPhone] = useState(user?.phone || "");
    const [vehicleType, setVehicleType] = useState("Bike");
    const [city, setCity] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyApplication();
        } else {
            setLoadingApp(false);
        }
    }, [isAuthenticated]);

    const fetchMyApplication = async () => {
        setLoadingApp(true);
        try {
            const res = await axiosClient.get("/delivery-applications/mine");
            const appData = res?.data?.data || res?.data || (res?.id ? res : null);
            setApplication(appData);
            if (appData) {
                if (appData.phone) setPhone(appData.phone);
                if (appData.vehicleType) setVehicleType(appData.vehicleType);
                if (appData.city) setCity(appData.city);
            }
        } catch (err) {
            console.error("Failed to fetch delivery application:", err);
            setApplication(null);
        } finally {
            setLoadingApp(false);
        }
    };

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        if (!phone || phone.trim().length < 10) {
            toast.error("Please enter a valid 10-digit mobile phone number");
            return;
        }
        if (!city || !city.trim()) {
            toast.error("Please enter your operating city");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await axiosClient.post("/delivery-applications", {
                phone: phone.trim(),
                vehicleType,
                city: city.trim(),
            });
            toast.success("Application submitted successfully! Awaiting admin review.");
            const appData = res?.data?.data || res?.data || (res?.id ? res : null);
            setApplication(appData);
            setIsReapplying(false);
        } catch (err) {
            toast.error(err?.message || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine current state flags
    const isApproved = user?.role === "DELIVERY_AGENT" || application?.status === "APPROVED";
    const isPending = application?.status === "PENDING";
    const isRejected = application?.status === "REJECTED";

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Brand Nav */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        to="/"
                        className="text-2xl font-extrabold flex items-center gap-2"
                        style={{ fontFamily: "'Baloo 2', sans-serif", color: '#570D48' }}
                    >
                        shoply <span className="text-sm font-semibold text-brand-600">Delivery Partner</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login?role=DELIVERY_AGENT"
                                    className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register?role=DELIVERY_AGENT"
                                    className="bg-brand-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-brand-700 transition-base"
                                >
                                    Register
                                </Link>
                            </>
                        ) : isApproved ? (
                            <Button
                                onClick={() => navigate("/delivery/available")}
                                className="bg-[#570D48] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#4a0b3d] transition-base flex items-center gap-2"
                            >
                                <Truck size={16} />
                                Start Delivering
                            </Button>
                        ) : (
                            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-600">
                                Back to Shoply
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Hero & Card Section */}
            <section className="bg-gradient-to-br from-brand-900 via-[#4a0b3d] to-[#570D48] text-white py-14 px-6 min-h-[70vh] flex items-center">
                <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Value Proposition */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-200 mb-6 border border-white/10">
                            <Truck size={16} />
                            <span>Shoply Logistics Network</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                            Deliver packages. <br />
                            <span className="text-pink-300">Earn on your terms.</span>
                        </h1>
                        <p className="text-gray-200 text-lg mt-4 max-w-lg leading-relaxed">
                            Join thousands of delivery agents partnering with Shoply. Apply today for official verification and access our delivery network.
                        </p>
                    </div>

                    {/* Right Column: Status Cards & Application Form */}
                    <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-100">
                        {loadingApp ? (
                            <div className="py-12 text-center text-gray-500 font-medium">
                                Checking application status...
                            </div>
                        ) : !isAuthenticated ? (
                            /* State 1: Unauthenticated User */
                            <div className="text-center py-6">
                                <Truck size={48} className="mx-auto text-[#570D48] mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Become a Delivery Partner</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Sign in or create a Shoply account to submit your Delivery Partner application.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => navigate("/register?role=DELIVERY_AGENT")}
                                        className="w-full !py-3 font-semibold bg-[#570D48] hover:bg-[#4a0b3d] text-white"
                                    >
                                        Create Account & Apply
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/login?role=DELIVERY_AGENT")}
                                        variant="secondary"
                                        className="w-full !py-3 font-semibold"
                                    >
                                        Sign In to Apply
                                    </Button>
                                </div>
                            </div>
                        ) : isApproved ? (
                            /* State 2: Approved Delivery Agent */
                            <div className="text-center py-6">
                                <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Approved</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    You're approved as a Delivery Partner. Click below to access your operational delivery portal.
                                </p>
                                <Button
                                    onClick={() => navigate("/delivery/available")}
                                    className="w-full !py-3.5 font-bold bg-[#570D48] hover:bg-[#4a0b3d] text-white flex items-center justify-center gap-2"
                                >
                                    <Truck size={20} />
                                    Start Delivering
                                </Button>
                            </div>
                        ) : isPending ? (
                            /* State 3: Already Applied / Pending Admin Review (NO FORM SHOWN) */
                            <div className="py-4">
                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                                    <Hourglass className="text-amber-600 shrink-0" size={28} />
                                    <div>
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded mb-1">
                                            Status: UNDER REVIEW
                                        </span>
                                        <h4 className="font-bold text-amber-900 text-base">Application Already Submitted</h4>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                                    Your Delivery Partner application is currently under review. Our admin team is evaluating your submitted details.
                                </p>

                                {/* Submitted Application Details Summary */}
                                <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 text-xs text-gray-700 border border-gray-200 mb-6">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Applicant Name:</span>
                                        <strong className="text-gray-900">{user?.name || application?.user?.name}</strong>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Email Address:</span>
                                        <strong className="text-gray-900">{user?.email || application?.user?.email}</strong>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Phone Number:</span>
                                        <strong className="font-mono text-gray-900">{application?.phone}</strong>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Registered Vehicle:</span>
                                        <strong className="text-gray-900">{application?.vehicleType || "Not specified"}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Operating City:</span>
                                        <strong className="text-gray-900">{application?.city || "Not specified"}</strong>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => navigate("/")}
                                    variant="secondary"
                                    className="w-full !py-3 font-semibold"
                                >
                                    Back to Shoply
                                </Button>
                            </div>
                        ) : isRejected && !isReapplying ? (
                            /* State 4: Application Rejected */
                            <div className="py-4">
                                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl mb-6">
                                    <AlertCircle className="text-rose-600 shrink-0" size={28} />
                                    <div>
                                        <span className="inline-block text-xs font-bold px-2 py-0.5 bg-rose-200 text-rose-900 rounded mb-1">
                                            APPLICATION REJECTED
                                        </span>
                                        <h4 className="font-bold text-rose-900 text-base">Application Rejected</h4>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Reason:</strong> {application?.rejectionReason || "Details did not meet requirements."}
                                </p>
                                <p className="text-xs text-gray-500 mb-6">
                                    You can update your information and submit a new application for review.
                                </p>

                                <Button
                                    onClick={() => setIsReapplying(true)}
                                    className="w-full !py-3.5 font-bold bg-[#570D48] hover:bg-[#4a0b3d] text-white"
                                >
                                    Reapply
                                </Button>
                            </div>
                        ) : (
                            /* State 5: Application Form (No application OR Reapplying) */
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {isReapplying ? "Resubmit Delivery Application" : "Become a Delivery Partner"}
                                </h3>
                                <p className="text-xs text-gray-600 mb-6">
                                    Submit your delivery details. An admin will review and approve your application.
                                </p>

                                <form onSubmit={handleSubmitApplication} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                                            <Input type="text" value={user?.name || ""} disabled className="bg-gray-100 cursor-not-allowed text-xs" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                                            <Input type="email" value={user?.email || ""} disabled className="bg-gray-100 cursor-not-allowed text-xs" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone Number *</label>
                                        <Input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter 10-digit mobile number"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type *</label>
                                        <select
                                            value={vehicleType}
                                            onChange={(e) => setVehicleType(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                        >
                                            <option value="Bike">Motorcycle / Bike</option>
                                            <option value="Scooter">Electric Scooter</option>
                                            <option value="ThreeWheeler">Auto / Three Wheeler</option>
                                            <option value="Van">Delivery Van / Truck</option>
                                            <option value="Bicycle">Bicycle / On Foot</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">City / Region *</label>
                                        <Input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g. Mumbai, Delhi, Bengaluru"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        isLoading={isSubmitting}
                                        className="w-full !py-3.5 font-bold bg-[#570D48] hover:bg-[#4a0b3d] text-white mt-2"
                                    >
                                        Submit Application
                                    </Button>

                                    {isReapplying && (
                                        <button
                                            type="button"
                                            onClick={() => setIsReapplying(false)}
                                            className="w-full text-center text-xs text-gray-500 hover:text-gray-700 mt-2 block"
                                        >
                                            Cancel Reapplication
                                        </button>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-brand-50/50 py-16 border-t border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
                        How Delivery Partner Approval Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {steps.map((step) => (
                            <div key={step.num} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative flex flex-col">
                                <div className="w-9 h-9 rounded-full bg-[#570D48] text-white flex items-center justify-center font-bold text-sm mb-4">
                                    {step.num}
                                </div>
                                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                                <p className="text-xs text-gray-600 leading-relaxed flex-1">{step.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BecomeDeliveryPartnerPage;
