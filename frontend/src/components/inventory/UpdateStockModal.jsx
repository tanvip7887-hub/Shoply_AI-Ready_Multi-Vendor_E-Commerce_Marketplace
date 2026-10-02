import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { sellerInventoryApi } from "../../api/inventory.api.js";
import Button from "../ui/Button.jsx";

const REASONS = [
  { value: "RESTOCK", label: "Restock" },
  { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
  { value: "RETURNED_ITEMS", label: "Returned Items" },
  { value: "DAMAGED_ITEMS", label: "Damaged Items" },
  { value: "OTHER", label: "Other" },
];

const UpdateStockModal = ({ inventory, onClose, onSuccess }) => {
  const [quantityChange, setQuantityChange] = useState("");
  const [reason, setReason] = useState("RESTOCK");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numChange = parseInt(quantityChange || "0", 10);
  const newStock = inventory.stock + numChange;
  const isNegative = newStock < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNegative || numChange === 0) return;

    setIsSubmitting(true);
    try {
      await sellerInventoryApi.updateStock(inventory.productId, {
        quantityChange: numChange,
        reason,
        notes,
      });
      toast.success("Stock updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Update Stock</h2>
            <p className="text-sm text-gray-500">For SKU: {inventory.product.sku}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-5 border border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current</p>
              <p className="text-xl font-bold text-gray-900">{inventory.stock}</p>
            </div>
            <div className="text-gray-300 font-medium text-xl">{numChange >= 0 ? "+" : "-"}</div>
            <div className="text-center">
              <p className="text-xs text-brand-600 font-medium uppercase tracking-wider mb-1">Change</p>
              <p className={`text-xl font-bold ${numChange > 0 ? "text-green-600" : numChange < 0 ? "text-red-600" : "text-gray-900"}`}>
                {Math.abs(numChange)}
              </p>
            </div>
            <div className="text-gray-300 font-medium text-xl">=</div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">New Stock</p>
              <p className={`text-xl font-bold ${isNegative ? "text-red-600" : "text-gray-900"}`}>{newStock}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Change</label>
              <input
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                placeholder="e.g. 50 or -10"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Use negative values to deduct stock.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none h-24"
              />
            </div>
          </div>

          {isNegative && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>Resulting stock cannot be negative. Please adjust the quantity.</p>
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isNegative || numChange === 0}>
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
