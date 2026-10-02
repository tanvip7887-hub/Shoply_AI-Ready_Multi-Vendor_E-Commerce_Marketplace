import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Clock } from "lucide-react";
import { sellerInventoryApi } from "../../api/inventory.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import { format } from "date-fns";

const statusBadge = {
  IN_STOCK: "bg-green-100 text-green-700",
  LOW_STOCK: "bg-orange-100 text-orange-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

const SellerInventoryHistoryPage = () => {
  const { productId } = useParams();
  const [inventory, setInventory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sellerInventoryApi.getById(productId)
      .then(res => setInventory(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full mb-6 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Inventory Not Found</h2>
        <Link to="/seller/inventory" className="text-brand-600 hover:underline">Return to Inventory</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/seller/inventory" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory History</h1>
          <p className="text-sm text-gray-400">Track stock movements for this product</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
          {/* Note: product relation data is expected if the API includes it, or we rely on basic info */}
          <Package className="w-full h-full p-3 text-gray-300" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">SKU: {inventory.product?.sku || "N/A"}</p>
          <h2 className="text-xl font-bold text-gray-900">{inventory.product?.name || "Product Name"}</h2>
        </div>
        <div className="flex gap-6 border-l border-gray-100 pl-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current Stock</p>
            <p className="text-2xl font-bold text-gray-900">{inventory.stock}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Reserved</p>
            <p className="text-2xl font-bold text-gray-500">{inventory.reservedStock}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-brand-600 font-medium uppercase tracking-wider mb-1">Available</p>
            <p className="text-2xl font-bold text-brand-600">{inventory.availableStock}</p>
          </div>
          <div className="text-center flex flex-col justify-center">
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${statusBadge[inventory.status] || "bg-gray-100 text-gray-700"}`}>
              {inventory.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 text-gray-700">
          <Clock size={18} />
          <h3 className="font-semibold">Stock Movement Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold text-center">Previous</th>
                <th className="px-6 py-4 font-semibold text-center">Change</th>
                <th className="px-6 py-4 font-semibold text-center">New Stock</th>
                <th className="px-6 py-4 font-semibold">Updated By</th>
                <th className="px-6 py-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!inventory.history || inventory.history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No history records found for this inventory.
                  </td>
                </tr>
              ) : (
                inventory.history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {format(new Date(record.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                        {record.reason.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-500">{record.previousStock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${record.quantityChange > 0 ? "text-green-600" : record.quantityChange < 0 ? "text-red-600" : "text-gray-500"}`}>
                        {record.quantityChange > 0 ? `+${record.quantityChange}` : record.quantityChange}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-gray-900">{record.newStock}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {record.updatedBy?.name || "System"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={record.notes}>
                      {record.notes || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerInventoryHistoryPage;
