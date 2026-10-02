import React, { useState } from "react";
import { createReturn } from "../api/return.api";
import { AlertCircle, X, CheckCircle, Package } from "lucide-react";

const RETURN_REASONS = [
  { id: "PRODUCT_DAMAGED", label: "Product damaged" },
  { id: "WRONG_PRODUCT", label: "Wrong product received" },
  { id: "SIZE_FIT_ISSUE", label: "Size/fit issue" },
  { id: "NOT_AS_EXPECTED", label: "Product not as expected" },
  { id: "MISSING_ITEM", label: "Missing item/accessories" },
  { id: "OTHER", label: "Other" },
];

const ReturnRequestModal = ({ orderItem, onClose, onSuccess }) => {
  const [reason, setReason] = useState(RETURN_REASONS[0].id);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a return reason.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createReturn({
        orderItemId: orderItem.id,
        reason,
        comment: comment.trim() || undefined,
      });

      if (response.success) {
        if (onSuccess) onSuccess(response.data);
        onClose();
      } else {
        setError(response.message || "Failed to submit return request");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit return request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Request Item Return</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex gap-4 items-center">
            {(() => {
              const imgSrc =
                orderItem.product?.images?.[0]?.url ||
                orderItem.product?.images?.[0]?.imageUrl ||
                (typeof orderItem.product?.images?.[0] === "string" ? orderItem.product.images[0] : null) ||
                orderItem.product?.primaryImage ||
                orderItem.productImage;
              return imgSrc ? (
                <img
                  src={imgSrc}
                  alt={orderItem.productName}
                  className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  <Package className="w-6 h-6" />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{orderItem.productName}</h4>
              <p className="text-sm text-gray-500">
                Qty: {orderItem.quantity} • Subtotal: <span className="font-bold text-gray-800">₹{orderItem.subtotal}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Reason for Return <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {RETURN_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    reason === r.id
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="returnReason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Additional Comment <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide details about the issue..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Refund Policy:</span> Refund of <span className="font-bold">₹{orderItem.subtotal}</span> will be processed to original payment method or external refund upon seller approval and item verification.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Return Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
