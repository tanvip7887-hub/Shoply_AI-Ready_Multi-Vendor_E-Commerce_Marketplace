import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Clock, Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { adminApi } from "../../api/admin.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";

const orderStatusColor = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};
const paymentStatusColor = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-200 text-gray-600",
};

const StatCard = ({ icon: Icon, label, value, isLoading }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
            <Icon size={18} />
        </div>
        <p className="text-xs text-gray-500">{label}</p>
        {isLoading ? <Skeleton className="h-6 w-12 mt-1" /> : <p className="text-xl font-bold text-gray-900">{value}</p>}
    </div>
);

const OrdersListPage = () => {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: "", orderStatus: "", paymentStatus: "", paymentMethod: "",
        datePreset: "", sortBy: "newest", page: 1,
    });

    useEffect(() => {
        adminApi.getOrderStats().then((res) => setStats(res.data)).catch(() => { }).finally(() => setStatsLoading(false));
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
        const timeout = setTimeout(() => {
            adminApi.getOrders(params)
                .then((res) => {
                    setOrders(res.data.items);
                    setPagination({ page: res.data.page, totalPages: res.data.totalPages });
                })
                .catch(() => { })
                .finally(() => setIsLoading(false));
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const update = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
            <p className="text-sm text-gray-400 mb-6">Monitor every order placed on the marketplace</p>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders} isLoading={statsLoading} />
                <StatCard icon={Clock} label="Today's Orders" value={stats?.todaysOrders} isLoading={statsLoading} />
                <StatCard icon={Hourglass} label="Pending" value={stats?.pendingOrders} isLoading={statsLoading} />
                <StatCard icon={CheckCircle2} label="Delivered" value={stats?.deliveredOrders} isLoading={statsLoading} />
                <StatCard icon={XCircle} label="Cancelled" value={stats?.cancelledOrders} isLoading={statsLoading} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 space-y-3">
                <input
                    type="text"
                    placeholder="Search order ID, customer, seller, or product..."
                    value={filters.search}
                    onChange={(e) => update("search", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-3">
                    <select value={filters.orderStatus} onChange={(e) => update("orderStatus", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                        <option value="">All Statuses</option>
                        {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filters.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                        <option value="">All Payment Status</option>
                        {["PAID", "PENDING", "FAILED", "REFUNDED"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filters.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                        <option value="">All Payment Methods</option>
                        <option value="COD">COD</option>
                        <option value="ONLINE">Online</option>
                    </select>
                    <select value={filters.datePreset} onChange={(e) => update("datePreset", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                    </select>
                    <select value={filters.sortBy} onChange={(e) => update("sortBy", e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount_high">Highest Amount</option>
                        <option value="amount_low">Lowest Amount</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Seller</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Payment Status</th>
                            <th className="px-4 py-3">Order Status</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-t"><td colSpan={9} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                            ))}
                        {!isLoading && orders.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No orders found</td></tr>
                        )}
                        {!isLoading &&
                            orders.map((o) => (
                                <tr key={o.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                                    <td className="px-4 py-3 text-gray-500">{o.user?.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{o.seller?.businessName}</td>
                                    <td className="px-4 py-3 font-medium">₹{o.totalAmount}</td>
                                    <td className="px-4 py-3 text-gray-500">{o.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${paymentStatusColor[o.paymentStatus]}`}>{o.paymentStatus}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${orderStatusColor[o.orderStatus]}`}>{o.orderStatus}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <Link to={`/admin/orders/${o.id}`} className="text-brand-600 font-medium hover:underline">View</Link>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => update("page", p)}
                            className={`w-8 h-8 rounded text-sm ${p === pagination.page ? "bg-brand-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersListPage;