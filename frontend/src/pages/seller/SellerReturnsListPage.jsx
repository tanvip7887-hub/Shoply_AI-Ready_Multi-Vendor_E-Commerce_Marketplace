import React, { useEffect, useState } from "react";
import {
  getSellerReturns,
  approveSellerReturn,
  rejectSellerReturn,
  inspectSellerReturn,
  processSellerRefund,
} from "../../api/return.api";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Search,
  Package,
  AlertCircle,
  FileCheck,
  DollarSign,
  X,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  const styles = {
    RETURN_REQUESTED: "bg-amber-100 text-amber-800 border-amber-300",
    RETURN_APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
    RETURN_REJECTED: "bg-red-100 text-red-800 border-red-300",
    PICKUP_SCHEDULED: "bg-purple-100 text-purple-800 border-purple-300",
    PICKED_UP: "bg-cyan-100 text-cyan-800 border-cyan-300",
    RECEIVED: "bg-indigo-100 text-indigo-800 border-indigo-300",
    INSPECTION: "bg-orange-100 text-orange-800 border-orange-300",
    REFUND_INITIATED: "bg-teal-100 text-teal-800 border-teal-300",
    REFUNDED: "bg-green-100 text-green-800 border-green-300",
    CANCELLED: "bg-gray-100 text-gray-700 border-gray-300",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${styles[status] || "bg-gray-100"}`}>
      {status ? status.replace(/_/g, " ") : "UNKNOWN"}
    </span>
  );
};

const SellerReturnsListPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Rejection Modal State
  const [rejectingReturn, setRejectingReturn] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const fetchReturns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSellerReturns();
      if (res.success) {
        setReturns(res.data || []);
      } else {
        setError(res.message || "Failed to load returns");
      }
    } catch (err) {
      setError(err.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this return request?")) return;
    setActionLoadingId(id);
    try {
      const res = await approveSellerReturn(id);
      if (res.success) {
        toast.success("Return request approved!");
        fetchReturns();
      } else {
        toast.error(res.message || "Failed to approve return");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve return");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }

    setActionLoadingId(rejectingReturn.id);
    setRejectError("");
    try {
      const res = await rejectSellerReturn(rejectingReturn.id, rejectionReason.trim());
      if (res.success) {
        toast.success("Return request rejected");
        setRejectingReturn(null);
        setRejectionReason("");
        fetchReturns();
      } else {
        setRejectError(res.message || "Failed to reject return");
      }
    } catch (err) {
      setRejectError(err.response?.data?.message || "Failed to reject return");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInspect = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await inspectSellerReturn(id, "Item received and inspected.");
      if (res.success) {
        toast.success("Return inspection complete!");
        fetchReturns();
      } else {
        toast.error(res.message || "Failed to inspect return");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to inspect return");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProcessRefund = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await processSellerRefund(id);
      if (res.success) {
        toast.success("Refund processed successfully!");
        fetchReturns();
      } else {
        toast.error(res.message || "Failed to process refund");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process refund");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReturns = filterStatus === "ALL" 
    ? returns 
    : returns.filter((r) => r.status === filterStatus);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-indigo-600" />
            Return Requests Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, approve, reject and manage customer return requests for your products.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED", "RECEIVED", "REFUNDED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {st === "ALL" ? "All Requests" : st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Return Requests Found</h3>
          <p className="text-sm text-gray-500 mt-1">There are no return requests matching the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product & Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Reason & Comment</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const imgSrc =
                            ret.product?.images?.[0]?.url ||
                            ret.product?.images?.[0]?.imageUrl ||
                            (typeof ret.product?.images?.[0] === "string" ? ret.product.images[0] : null) ||
                            ret.product?.primaryImage ||
                            ret.orderItem?.productImage;
                          return imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={ret.orderItem?.productName || ret.product?.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">
                            {ret.orderItem?.productName || ret.product?.name}
                          </p>
                          <p className="text-xs text-indigo-600 font-mono font-semibold">
                            Order #{ret.orderId} • Return #{ret.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      <p className="font-semibold">{ret.customer?.name || "Customer"}</p>
                      <p className="text-xs text-gray-500">{ret.customer?.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900 text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {ret.reason.replace(/_/g, " ")}
                      </span>
                      {ret.comment && <p className="text-xs text-gray-500 italic mt-1 max-w-xs">"{ret.comment}"</p>}
                      {ret.rejectionReason && (
                        <p className="text-xs text-red-600 font-medium mt-1">Rejection: {ret.rejectionReason}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      ₹{ret.orderItem?.subtotal}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={ret.status} />
                      {ret.refund && (
                        <span className="block text-[11px] text-gray-500 mt-1 font-medium">
                          Refund: <span className="font-semibold text-gray-800">{ret.refund.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ret.status === "RETURN_REQUESTED" && (
                          <>
                            <button
                              onClick={() => handleApprove(ret.id)}
                              disabled={actionLoadingId === ret.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingReturn(ret);
                                setRejectionReason("");
                                setRejectError("");
                              }}
                              disabled={actionLoadingId === ret.id}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {ret.status === "RECEIVED" && (
                          <button
                            onClick={() => handleInspect(ret.id)}
                            disabled={actionLoadingId === ret.id}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> Mark Inspected
                          </button>
                        )}

                        {["INSPECTION", "REFUND_INITIATED"].includes(ret.status) && (
                          <button
                            onClick={() => handleProcessRefund(ret.id)}
                            disabled={actionLoadingId === ret.id}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Complete Refund
                          </button>
                        )}

                        {ret.status === "REFUNDED" && (
                          <span className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                            Resolved ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" /> Reject Return Request
              </h3>
              <button
                onClick={() => setRejectingReturn(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Please provide a clear reason for rejecting the return request for{" "}
              <span className="font-semibold text-gray-900">{rejectingReturn.orderItem?.productName}</span>.
            </p>

            {rejectError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this return request is being rejected..."
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReturn(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectingReturn.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReturnsListPage;
