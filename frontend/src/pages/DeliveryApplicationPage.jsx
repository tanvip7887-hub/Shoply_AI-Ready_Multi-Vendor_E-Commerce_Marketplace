import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Truck, CheckCircle, AlertCircle, Hourglass, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

const DeliveryApplicationPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [phone, setPhone] = useState(user?.phone || "");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [city, setCity] = useState("");

  useEffect(() => {
    fetchMyApplication();
  }, []);

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
    } finally {
      setLoadingApp(false);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
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
    } catch (err) {
      toast.error(err?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium">
        Loading application status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/become-delivery-partner"
            className="text-2xl font-extrabold flex items-center gap-2"
            style={{ fontFamily: "'Baloo 2', sans-serif", color: "#570D48" }}
          >
            shoply <span className="text-sm font-semibold text-brand-600">Delivery Partner</span>
          </Link>
          <Link
            to="/become-delivery-partner"
            className="text-xs font-semibold text-gray-600 hover:text-brand-600 flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Overview
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 mx-auto flex items-center justify-center mb-3">
            <Truck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Delivery Partner Application
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit your delivery details to apply for a Delivery Agent account with Shoply.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          {/* APPROVED / ROLE IS DELIVERY_AGENT */}
          {user?.role === "DELIVERY_AGENT" || application?.status === "APPROVED" ? (
            <div className="text-center py-6">
              <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Approved!</h2>
              <p className="text-sm text-gray-600 mb-6">
                Your account is verified as an official <strong>Delivery Agent</strong>. You have full access to view available pickups and manage shipments.
              </p>
              <Button
                onClick={() => navigate("/delivery/available")}
                className="w-full !py-3.5 font-bold bg-[#570D48] hover:bg-[#4a0b3d] text-white flex items-center justify-center gap-2"
              >
                <Truck size={20} />
                Go to Delivery Dashboard
              </Button>
            </div>
          ) : application?.status === "PENDING" ? (
            /* PENDING STATUS */
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <Hourglass className="text-amber-600 shrink-0" size={28} />
                <div>
                  <span className="inline-block text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded mb-1">
                    APPLICATION PENDING
                  </span>
                  <h3 className="font-bold text-amber-900 text-base">Under Admin Review</h3>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 font-medium mb-6">
                Application submitted successfully. Your application is pending admin review.
              </div>

              <div className="bg-gray-50 p-5 rounded-xl space-y-3 text-sm text-gray-700 border border-gray-200 mb-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Applicant Name:</span>
                  <strong className="text-gray-900">{user?.name}</strong>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Applicant Email:</span>
                  <strong className="text-gray-900">{user?.email}</strong>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Mobile Phone:</span>
                  <strong className="text-gray-900 font-mono">{application.phone}</strong>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Vehicle Type:</span>
                  <strong className="text-gray-900">{application.vehicleType || "Not specified"}</strong>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">City / Region:</span>
                  <strong className="text-gray-900">{application.city || "Not specified"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted On:</span>
                  <strong className="text-gray-900">
                    {new Date(application.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Once approved by an admin, your account will be automatically updated to <strong>DELIVERY_AGENT</strong> and you can access the Delivery Portal.
              </p>
            </div>
          ) : (
            /* FORM: NEW APPLICATION OR REJECTED RESUBMISSION */
            <div>
              {application?.status === "REJECTED" && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mb-6 text-sm text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-base mb-1">
                    <AlertCircle size={18} /> Application Rejected
                  </div>
                  <p className="mb-1">
                    <strong>Reason:</strong> {application.rejectionReason || "Details did not meet requirements."}
                  </p>
                  <p className="text-xs text-rose-700 mt-2">
                    Please update your information below and submit a new application.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitApplication} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <Input type="text" value={user?.name || ""} disabled className="bg-gray-100 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <Input type="email" value={user?.email || ""} disabled className="bg-gray-100 cursor-not-allowed" />
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full !py-3.5 font-bold bg-[#570D48] hover:bg-[#4a0b3d] text-white"
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryApplicationPage;
