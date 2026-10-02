import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReturns, cancelMyReturn } from "../api/return.api";
import { RotateCcw, Package, Clock, AlertCircle, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import Skeleton from "../components/ui/Skeleton";
import toast from "react-hot-toast";

const RETURN_STAGES = [
  { key: "RETURN_REQUESTED", label: "Return Requested" },
  { key: "RETURN_APPROVED", label: "Return Approved" },
  { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "RECEIVED", label: "Received" },
  { key: "INSPECTION", label: "Inspection" },
  { key: "REFUND_INITIATED", label: "Refund Initiated" },
  { key: "REFUNDED", label: "Refund Completed" },
];

const STAGE_ORDER = {
  RETURN_REQUESTED: 0,
  RETURN_APPROVED: 1,
  PICKUP_SCHEDULED: 2,
  PICKED_UP: 3,
  RECEIVED: 4,
  INSPECTION: 5,
  REFUND_INITIATED: 6,
  REFUNDED: 7,
};

const StatusBadge = ({ status }) => {
  const badgeStyles = {
    RETURN_REQUESTED: "bg-amber-100 text-amber-800 border-amber-200",
    RETURN_APPROVED: "bg-blue-100 text-blue-800 border-blue-200",
    RETURN_REJECTED: "bg-red-100 text-red-800 border-red-200",
    PICKUP_SCHEDULED: "bg-purple-100 text-purple-800 border-purple-200",
    PICKED_UP: "bg-cyan-100 text-cyan-800 border-cyan-200",
    RECEIVED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    INSPECTION: "bg-orange-100 text-orange-800 border-orange-200",
    REFUND_INITIATED: "bg-teal-100 text-teal-800 border-teal-200",
    REFUNDED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
        badgeStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status ? status.replace(/_/g, " ") : "UNKNOWN"}
    </span>
  );
};

const ReturnTrackingTimeline = ({ returnReq }) => {
  if (returnReq.status === "RETURN_REJECTED") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
          <XCircle className="w-5 h-5 text-red-600" />
          <span>Return Rejected by Seller</span>
        </div>
        {returnReq.rejectionReason && (
          <p className="text-sm text-red-600 bg-white p-3 rounded-lg border border-red-100">
            <span className="font-semibold">Reason:</span> "{returnReq.rejectionReason}"
          </p>
        )}
      </div>
    );
  }

  if (returnReq.status === "CANCELLED") {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm flex items-center gap-2">
        <XCircle className="w-5 h-5 text-gray-400" />
        <span>Return request was cancelled by customer.</span>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER[returnReq.status] ?? 0;

  return (
    <div className="py-2">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Return Progress</h4>
      <div className="space-y-3">
        {RETURN_STAGES.map((stage, idx) => {
          const isCompleted = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    isCurrent
                      ? "font-bold text-gray-900"
                      : isCompleted
                      ? "font-medium text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MyReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReturns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyReturns();
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

  const handleCancelReturn = async (returnId) => {
    if (!window.confirm("Are you sure you want to cancel this return request?")) return;

    try {
      const res = await cancelMyReturn(returnId);
      if (res.success) {
        toast.success("Return request cancelled");
        fetchReturns();
      } else {
        toast.error(res.message || "Failed to cancel return");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel return");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-indigo-600" />
            My Returns & Refunds
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your item return requests and refund updates.
          </p>
        </div>
        <Link
          to="/orders"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
        >
          View All Orders <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {returns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Return Requests Found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            You haven't requested returns for any items yet. Returns can be initiated within 7 days of order delivery.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            Go to My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((ret) => (
            <div
              key={ret.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-gray-500">RETURN #{ret.id}</span>
                    <StatusBadge status={ret.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Requested on{" "}
                    {new Date(ret.requestedAt || ret.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Refund Amount</span>
                  <span className="text-lg font-extrabold text-gray-900">₹{ret.orderItem?.subtotal}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 grid md:grid-cols-12 gap-6">
                {/* Product Details */}
                <div className="md:col-span-6 space-y-4">
                  <div className="flex gap-4">
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
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
                          <Package className="w-8 h-8" />
                        </div>
                      );
                    })()}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {ret.orderItem?.productName || ret.product?.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Order #{ret.orderId} • Seller:{" "}
                        <span className="font-semibold text-gray-800">
                          {ret.seller?.businessName || ret.seller?.user?.name}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="font-semibold text-gray-700">Reason:</span> {ret.reason.replace(/_/g, " ")}
                        {ret.comment && <span className="block italic text-gray-500 mt-0.5">"{ret.comment}"</span>}
                      </p>
                    </div>
                  </div>

                  {/* Refund Status Card */}
                  {ret.refund && (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>Refund Status</span>
                        <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          {ret.refund.status}
                        </span>
                      </div>
                      <p className="text-emerald-800">
                        Method: <span className="font-semibold">{ret.refund.paymentMethod}</span> • Reference:{" "}
                        <span className="font-mono">{ret.refund.transactionReference || "N/A"}</span>
                      </p>
                    </div>
                  )}

                  {ret.status === "RETURN_REQUESTED" && (
                    <button
                      onClick={() => handleCancelReturn(ret.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                    >
                      Cancel Return Request
                    </button>
                  )}
                </div>

                {/* Timeline */}
                <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <ReturnTrackingTimeline returnReq={ret} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReturnsPage;
