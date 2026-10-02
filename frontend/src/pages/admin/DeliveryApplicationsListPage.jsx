import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Truck } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];
const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-800 border border-rose-200",
};

const DeliveryApplicationsListPage = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reject Modal state
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await axiosClient.get(`/delivery-applications${params}`);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : (res?.data?.data || []);
      setApplications(list);
    } catch (err) {
      toast.error("Failed to load delivery applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this application? The user will be promoted to DELIVERY_AGENT.")) return;
    setActionLoadingId(id);
    try {
      await axiosClient.patch(`/delivery-applications/${id}/approve`);
      toast.success("Application approved! User role updated to DELIVERY_AGENT.");
      fetchApplications();
    } catch (err) {
      toast.error(err?.message || "Failed to approve application");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoadingId(rejectingApp.id);
    try {
      await axiosClient.patch(`/delivery-applications/${rejectingApp.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Application rejected.");
      setRejectingApp(null);
      setRejectionReason("");
      fetchApplications();
    } catch (err) {
      toast.error(err?.message || "Failed to reject application");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="text-[#570D48]" />
            Delivery Partner Applications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review applicant requests and approve accounts to grant DELIVERY_AGENT role.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-base ${
              filter === f ? "bg-[#570D48] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
            <tr>
              <th className="px-4 py-3.5">Applicant Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Phone</th>
              <th className="px-4 py-3.5">Vehicle</th>
              <th className="px-4 py-3.5">City</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Applied Date</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td colSpan={8} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))}

            {!isLoading && applications.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No delivery applications found.
                </td>
              </tr>
            )}

            {!isLoading &&
              applications.map((app) => (
                <tr key={app.id} className="border-t hover:bg-gray-50/50">
                  <td className="px-4 py-3.5 font-semibold text-gray-900">{app.user?.name || "N/A"}</td>
                  <td className="px-4 py-3.5 text-gray-600">{app.user?.email}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-800">{app.phone}</td>
                  <td className="px-4 py-3.5 text-gray-700">{app.vehicleType || "—"}</td>
                  <td className="px-4 py-3.5 text-gray-700">{app.city || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusColor[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {app.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoadingId === app.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-base disabled:opacity-50"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingApp(app);
                            setRejectionReason("");
                          }}
                          disabled={actionLoadingId === app.id}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-base disabled:opacity-50"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectingApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShieldAlert className="text-rose-600" />
              Reject Delivery Application
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Rejecting applicant <strong>{rejectingApp.user?.name || rejectingApp.user?.email}</strong>.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm mb-4 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setRejectingApp(null)}
                className="!py-2 !px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReject}
                isLoading={actionLoadingId === rejectingApp.id}
                className="!py-2 !px-4 text-xs font-semibold !bg-rose-600 hover:!bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryApplicationsListPage;
