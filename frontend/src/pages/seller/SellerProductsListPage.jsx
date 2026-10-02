import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { productApi } from "../../api/product.api.js";
import { categoryApi } from "../../api/category.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

const statusBadge = {
    ACTIVE: "bg-green-100 text-green-700",
    DISABLED: "bg-gray-200 text-gray-500",
    OUT_OF_STOCK: "bg-red-100 text-red-700",
    DELETED: "bg-red-100 text-red-700",
};

const SellerProductsListPage = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const [filters, setFilters] = useState({ search: "", categoryId: "", status: "", sortBy: "newest", page: 1 });

    useEffect(() => {
        categoryApi.getAll().then((res) => setCategories(res.data)).catch(() => { });
    }, []);

    const load = () => {
        setIsLoading(true);
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        productApi.getMine(params).then((res) => {
            setProducts(res.data.items);
            setPagination({ page: res.data.page, totalPages: res.data.totalPages });
        }).catch(() => { }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        const timeout = setTimeout(load, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const update = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

    const toggleStatus = async (product) => {
        setActionId(product.id);
        try {
            await productApi.updateStatus(product.id, !product.isActive);
            toast.success(product.isActive ? "Product disabled" : "Product enabled");
            load();
        } catch (err) {
            // interceptor toasts
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.name}"? This will remove it from your store.`)) return;
        setActionId(product.id);
        try {
            await productApi.delete(product.id);
            toast.success("Product deleted");
            load();
        } catch (err) {
            // interceptor toasts
        } finally {
            setActionId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Products</h1>
                    <p className="text-sm text-gray-400">Manage your product listings</p>
                </div>
                <Link to="/seller/products/new">
                    <Button>+ Add Product</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search name or SKU..."
                    value={filters.search}
                    onChange={(e) => update("search", e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[200px]"
                />
                <select value={filters.categoryId} onChange={(e) => update("categoryId", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => update("status", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <select value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="alphabetical">Alphabetical</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Category / Brand</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Approval</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i} className="border-t"><td colSpan={9} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                        ))}
                        {!isLoading && products.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No products yet. Add your first product to get started.</td></tr>
                        )}
                        {!isLoading && products.map((p) => (
                            <tr key={p.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <img src={p.images?.[0]?.url || "https://placehold.co/48x48?text=No+Img"} alt="" className="w-12 h-12 rounded-md object-cover" />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{p.sku}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {p.category?.name} <br />
                                    {p.brand?.name && <span className="text-gray-400">{p.brand.name}</span>}
                                </td>
                                <td className="px-4 py-3">
                                    {p.discountPrice ? (
                                        <>
                                            <span className="font-semibold text-gray-900">₹{p.discountPrice}</span>
                                            <span className="text-gray-400 line-through text-xs ml-1">₹{p.price}</span>
                                        </>
                                    ) : (
                                        <span className="font-semibold text-gray-900">₹{p.price}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">{p.availableStock}</td>
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
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge[p.computedStatus]}`}>{p.computedStatus}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 space-x-3 text-xs text-right">
                                    <Link to={`/seller/products/${p.id}`} className="text-brand-600 font-medium hover:underline">View</Link>
                                    <Link to={`/seller/products/${p.id}/edit`} className="text-brand-600 font-medium hover:underline">Edit</Link>
                                    <button onClick={() => toggleStatus(p)} disabled={actionId === p.id} className="text-gray-600 font-medium hover:underline">
                                        {p.isActive ? "Disable" : "Enable"}
                                    </button>
                                    <button onClick={() => handleDelete(p)} disabled={actionId === p.id} className="text-red-600 font-medium hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!isLoading && (
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => update("page", p)} />
            )}
        </div>
    );
};

export default SellerProductsListPage;