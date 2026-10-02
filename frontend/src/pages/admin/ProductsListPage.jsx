import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";

const ProductsListPage = () => {
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED, DISABLED, DELETED
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // Modal states
  const [previewProduct, setPreviewProduct] = useState(null);
  const [rejectProduct, setRejectProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");

  const predefinedReasons = [
    "Wrong Images",
    "Wrong Category",
    "Duplicate Listing",
    "Copyright Issue",
    "Restricted Product",
    "Poor Description",
    "Other",
  ];

  const load = () => {
    setIsLoading(true);
    const params = { sellerId: sellerId || undefined };
    if (filter === "PENDING") params.status = "PENDING";
    if (filter === "APPROVED") params.status = "APPROVED";
    if (filter === "REJECTED") params.status = "REJECTED";
    if (filter === "DISABLED") params.isActive = "false";
    if (filter === "DELETED") params.isDeleted = "true";
    
    // Default hiding of deleted and disabled if not explicitly requested
    if (filter !== "DELETED") params.isDeleted = "false";
    
    if (search) params.search = search;

    adminApi.getProducts(params).then((res) => setProducts(res.data)).catch(() => {}).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [filter, search, sellerId]);

  const toggleStatus = async (product) => {
    setActionId(product.id);
    try {
      await adminApi.updateProductStatus(product.id, !product.isActive);
      toast.success(product.isActive ? "Product disabled" : "Product enabled");
      load();
    } catch (err) {
    } finally {
      setActionId(null);
    }
  };

  const handleSoftDelete = async (product) => {
    if (!window.confirm(`Soft-delete "${product.name}"? It will be hidden from the marketplace.`)) return;
    setActionId(product.id);
    try {
      await adminApi.deleteProduct(product.id);
      toast.success("Product deleted");
      load();
    } catch (err) {
    } finally {
      setActionId(null);
    }
  };

  const handleApprove = async (product) => {
    setActionId(product.id);
    try {
      await adminApi.approveProduct(product.id);
      toast.success("Product approved successfully");
      setPreviewProduct(null);
      load();
    } catch (err) {
    } finally {
      setActionId(null);
    }
  };

  const submitReject = async () => {
    if (!rejectProduct) return;
    const finalReason = rejectReason === "Other" ? customRejectReason : rejectReason;
    if (!finalReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    
    setActionId(rejectProduct.id);
    try {
      await adminApi.rejectProduct(rejectProduct.id, finalReason);
      toast.success("Product rejected");
      setRejectProduct(null);
      setPreviewProduct(null);
      setRejectReason("");
      setCustomRejectReason("");
      load();
    } catch (err) {
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Products</h1>
      <p className="text-sm text-gray-400 mb-6">
        {sellerId ? "Showing products for selected seller" : "Marketplace product moderation"}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "DISABLED", "DELETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-base ${
                filter === f ? "bg-brand-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t"><td colSpan={10} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
              ))}
            {!isLoading && products.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No products found</td></tr>
            )}
            {!isLoading &&
              products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={p.images?.[0]?.url || "https://placehold.co/48x48?text=No+Img"}
                      alt=""
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.seller?.businessName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                  <td className="px-4 py-3">₹{p.discountPrice ?? p.price}</td>
                  <td className="px-4 py-3">{p.inventory?.stock ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                      p.approvalStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {p.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.isDeleted ? "bg-gray-200 text-gray-500" : p.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.isDeleted ? "DELETED" : p.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => setPreviewProduct(p)}
                      className="text-brand-600 font-medium hover:underline text-xs"
                    >
                      View
                    </button>
                    {p.approvalStatus === "PENDING" && !p.isDeleted && (
                      <>
                        <button
                          onClick={() => handleApprove(p)}
                          disabled={actionId === p.id}
                          className="text-green-600 font-medium hover:underline text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectProduct(p)}
                          disabled={actionId === p.id}
                          className="text-red-600 font-medium hover:underline text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {!p.isDeleted && (
                      <>
                        <button
                          onClick={() => toggleStatus(p)}
                          disabled={actionId === p.id}
                          className="text-gray-600 font-medium hover:underline text-xs"
                        >
                          {p.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleSoftDelete(p)}
                          disabled={actionId === p.id}
                          className="text-red-600 font-medium hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Product Preview</h2>
              <button onClick={() => setPreviewProduct(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <img src={previewProduct.images?.[0]?.url || "https://placehold.co/400?text=No+Image"} alt="" className="w-full h-64 object-cover rounded-lg border" />
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Name</label>
                  <p className="font-medium text-base">{previewProduct.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Description</label>
                  <p className="text-gray-600">{previewProduct.description || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Category</label>
                    <p>{previewProduct.category?.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Brand</label>
                    <p>{previewProduct.brand?.name || "Unbranded"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">SKU</label>
                    <p>{previewProduct.sku}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Price</label>
                    <p>₹{previewProduct.price}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Dimensions</label>
                    <p>{previewProduct.length || "-"} x {previewProduct.width || "-"} x {previewProduct.height || "-"} cm</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Weight</label>
                    <p>{previewProduct.weight ? `${previewProduct.weight} kg` : "-"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t flex gap-3">
                   {previewProduct.approvalStatus === "PENDING" && (
                     <>
                        <Button onClick={() => handleApprove(previewProduct)} isLoading={actionId === previewProduct.id} className="flex-1 bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button variant="outline" onClick={() => setRejectProduct(previewProduct)} className="flex-1 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                     </>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Product</h2>
            <p className="text-sm text-gray-500 mb-4">Select a reason for rejecting "{rejectProduct.name}".</p>
            
            <div className="space-y-3 mb-6">
              {predefinedReasons.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rejectReason" value={r} checked={rejectReason === r} onChange={(e) => setRejectReason(e.target.value)} className="text-brand-600" />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
              
              {rejectReason === "Other" && (
                <textarea 
                  className="w-full border rounded-md p-2 text-sm mt-2" 
                  rows="3" 
                  placeholder="Enter custom reason..."
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setRejectProduct(null); setRejectReason(""); setCustomRejectReason(""); }}>Cancel</Button>
              <Button onClick={submitReject} isLoading={actionId === rejectProduct.id} className="bg-red-600 hover:bg-red-700 text-white">Confirm Reject</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsListPage;