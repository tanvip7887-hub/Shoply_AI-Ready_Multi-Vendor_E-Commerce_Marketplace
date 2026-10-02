import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { sellerInventoryApi } from "../../api/inventory.api.js";
import { categoryApi } from "../../api/category.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import UpdateStockModal from "../../components/inventory/UpdateStockModal.jsx";
import { Package, AlertCircle, AlertTriangle, Boxes } from "lucide-react";

const statusBadge = {
  IN_STOCK: "bg-green-100 text-green-700 border border-green-200",
  LOW_STOCK: "bg-orange-100 text-orange-700 border border-orange-200",
  OUT_OF_STOCK: "bg-red-100 text-red-700 border border-red-200",
};

const SellerInventoryListPage = () => {
  const [inventories, setInventories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [filters, setFilters] = useState({ search: "", status: "", sortBy: "updatedAt_desc", page: 1 });

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data)).catch(() => {});
    loadSummary();
  }, []);

  const loadSummary = () => {
    sellerInventoryApi.getSummary().then(res => setSummary(res.data)).catch(() => {});
  };

  const load = () => {
    setIsLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    sellerInventoryApi.getAll(params).then((res) => {
      setInventories(res.data.inventories);
      setPagination({ page: res.data.pagination.page, totalPages: res.data.pagination.totalPages });
    }).catch(() => {}).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const handleUpdateStock = (inventory) => {
    setSelectedInventory(inventory);
    setIsUpdateModalOpen(true);
  };

  const handleStockUpdated = () => {
    load();
    loadSummary();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory Management</h1>
        <p className="text-sm text-gray-400">Track and manage your physical stock across all products.</p>
      </div>

      {/* Stock Movement Summary Cards */}
      {summary && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center text-gray-500 mb-1 gap-2"><Package size={16}/> <span className="text-sm font-medium">Total Products</span></div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalProducts}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center text-green-600 mb-1 gap-2"><Boxes size={16}/> <span className="text-sm font-medium">In Stock</span></div>
            <p className="text-2xl font-bold text-gray-900">{summary.inStock}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center text-orange-600 mb-1 gap-2"><AlertTriangle size={16}/> <span className="text-sm font-medium">Low Stock</span></div>
            <p className="text-2xl font-bold text-gray-900">{summary.lowStock}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center text-red-600 mb-1 gap-2"><AlertCircle size={16}/> <span className="text-sm font-medium">Out of Stock</span></div>
            <p className="text-2xl font-bold text-gray-900">{summary.outOfStock}</p>
          </div>
          <div className="bg-brand-50 rounded-xl border border-brand-200 shadow-sm p-4">
            <div className="flex items-center text-brand-700 mb-1 gap-2"><Boxes size={16}/> <span className="text-sm font-medium">Total Units Available</span></div>
            <p className="text-2xl font-bold text-brand-900">{summary.totalUnits}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name or SKU..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[200px]"
        />
        <select value={filters.status} onChange={(e) => update("status", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
          <option value="">All Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
        <select value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
          <option value="updatedAt_desc">Newest Updates</option>
          <option value="stock_desc">Stock: High to Low</option>
          <option value="stock_asc">Stock: Low to High</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold text-center">SKU</th>
                <th className="px-6 py-4 font-semibold text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-center">Reserved</th>
                <th className="px-6 py-4 font-semibold text-center">Available</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-12 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-12 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-12 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                inventories.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {inv.product.images?.[0]?.url ? (
                            <img src={inv.product.images[0].url} alt={inv.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-2 text-gray-300" />
                          )}
                        </div>
                        <div className="font-medium text-gray-900 line-clamp-2 max-w-[250px]">{inv.product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-500">
                      {inv.product.sku || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">
                      {inv.stock}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {inv.reservedStock}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-brand-600">
                      {inv.availableStock}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge[inv.status]}`}>
                        {inv.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStock(inv)}>Update</Button>
                        <Link to={`/seller/inventory/${inv.productId}`}>
                          <Button size="sm" variant="secondary">History</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && inventories.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => update("page", page)}
        />
      )}

      {isUpdateModalOpen && selectedInventory && (
        <UpdateStockModal
          inventory={selectedInventory}
          onClose={() => setIsUpdateModalOpen(false)}
          onSuccess={handleStockUpdated}
        />
      )}
    </div>
  );
};

export default SellerInventoryListPage;
