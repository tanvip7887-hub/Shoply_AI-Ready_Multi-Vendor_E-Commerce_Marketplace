import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { User, Phone, Mail, Truck, MapPin, ShieldCheck, Calendar } from "lucide-react";
import axiosClient from "../../api/axiosClient.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import toast from "react-hot-toast";

const DeliveryProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const fetchProfileInfo = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/delivery-applications/mine");
      const appData = res?.data?.data || res?.data || (res?.id ? res : null);
      setApplication(appData);
    } catch (err) {
      console.error("Failed to load delivery profile info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
        <p className="text-sm text-gray-500">
          Your verified Delivery Partner onboarding and account details (Read-only).
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-900 via-[#570D48] to-brand-700 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl border border-white/20">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name || "Delivery Agent"}</h2>
                <p className="text-xs text-brand-200">{user?.email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck size={14} />
              Verified Agent
            </span>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Phone className="text-brand-600 shrink-0 mt-0.5" size={20} />
              <div>
                <span className="text-xs font-medium text-gray-500 block">Phone Number</span>
                <span className="text-sm font-bold text-gray-900 font-mono">
                  {application?.phone || user?.phone || "Not specified"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Truck className="text-brand-600 shrink-0 mt-0.5" size={20} />
              <div>
                <span className="text-xs font-medium text-gray-500 block">Registered Vehicle</span>
                <span className="text-sm font-bold text-gray-900">
                  {application?.vehicleType || "Motorcycle / Bike"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <MapPin className="text-brand-600 shrink-0 mt-0.5" size={20} />
              <div>
                <span className="text-xs font-medium text-gray-500 block">Operating City</span>
                <span className="text-sm font-bold text-gray-900">
                  {application?.city || "Not specified"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Mail className="text-brand-600 shrink-0 mt-0.5" size={20} />
              <div>
                <span className="text-xs font-medium text-gray-500 block">Email Address</span>
                <span className="text-sm font-bold text-gray-900">{user?.email}</span>
              </div>
            </div>

            {application?.createdAt && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                <Calendar className="text-brand-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="text-xs font-medium text-gray-500 block">Application Approved On</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(application.updatedAt || application.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProfilePage;
