import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingBag, Clock, Wallet, TrendingUp, Package, AlertTriangle, XCircle } from "lucide-react";
import { sellerDashboardApi } from "../../api/sellerDashboard.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";

const orderStatusColor = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    READY_TO_SHIP: "bg-indigo-100 text-indigo-700",
    SHIPPED: "bg-cyan-100 text-cyan-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const KpiCard = ({ icon: Icon, label, value, isLoading }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
            <Icon size={18} />
        </div>
        <p className="text-xs text-gray-500">{label}</p>
        {isLoading ? <Skeleton className="h-6 w-14 mt-1" /> : <p className="text-xl font-bold text-gray-900">{value}</p>}
    </div>
);

const SellerDashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        sellerDashboardApi.getDashboard().then((res) => setData(res.data)).catch(() => { }).finally(() => setIsLoading(false));
    }, []);

    return (
        <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h1 className="text-xl font-bold text-gray-900">Hello, {user?.name} 👋</h1>
                <p className="text-gray-500 text-sm mt-1">Here's what's happening in your business today.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard icon={ShoppingBag} label="Today's Orders" value={data?.kpis.todaysOrders} isLoading={isLoading} />
                <KpiCard icon={Clock} label="Pending Orders" value={data?.kpis.pendingOrders} isLoading={isLoading} />
                <KpiCard icon={Wallet} label="Revenue Today" value={`₹${data?.kpis.revenueToday ?? 0}`} isLoading={isLoading} />
                <KpiCard icon={TrendingUp} label="Total Revenue" value={`₹${data?.kpis.totalRevenue ?? 0}`} isLoading={isLoading} />
                <KpiCard icon={Package} label="Active Products" value={data?.kpis.activeProducts} isLoading={isLoading} />
                <KpiCard icon={AlertTriangle} label="Low Stock" value={data?.kpis.lowStockProducts} isLoading={isLoading} />
                <KpiCard icon={XCircle} label="Out of Stock" value={data?.kpis.outOfStockProducts} isLoading={isLoading} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 text-left border-b border-gray-100">
                            <tr><th className="pb-2">Order</th><th className="pb-2">Customer</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr>
                        </thead>
                        <tbody>
                            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i}><td colSpan={4} className="py-2"><Skeleton className="h-5 w-full" /></td></tr>
                            ))}
                            {!isLoading && data?.recentOrders.length === 0 && (
                                <tr><td colSpan={4} className="py-6 text-center text-gray-400">No orders yet</td></tr>
                            )}
                            {!isLoading && data?.recentOrders.map((o) => (
                                <tr key={o.id} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2.5">#{o.id}</td>
                                    <td className="py-2.5 text-gray-500">{o.user?.name}</td>
                                    <td className="py-2.5 font-medium">₹{o.totalAmount}</td>
                                    <td className="py-2.5">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${orderStatusColor[o.orderStatus]}`}>{o.orderStatus}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Link to="/seller/orders" className="text-brand-600 text-xs font-semibold hover:underline mt-3 inline-block">
                        View all orders →
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Best Selling Products</h3>
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 text-left border-b border-gray-100">
                            <tr><th className="pb-2">Product</th><th className="pb-2">Units Sold</th><th className="pb-2">Revenue</th></tr>
                        </thead>
                        <tbody>
                            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i}><td colSpan={3} className="py-2"><Skeleton className="h-5 w-full" /></td></tr>
                            ))}
                            {!isLoading && data?.bestSellingProducts.length === 0 && (
                                <tr><td colSpan={3} className="py-6 text-center text-gray-400">No sales yet</td></tr>
                            )}
                            {!isLoading && data?.bestSellingProducts.map((p) => (
                                <tr key={p.productId} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2.5">{p.name}</td>
                                    <td className="py-2.5">{p.unitsSold}</td>
                                    <td className="py-2.5 font-medium">₹{p.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { to: "/seller/products", label: "Add Product" },
                    { to: "/seller/orders", label: "Manage Orders" },
                    { to: "/seller/inventory", label: "Inventory" },
                    { to: "/seller/payments", label: "View Payments" },
                ].map((action) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center text-sm font-medium text-gray-700 hover:shadow-md hover:-translate-y-0.5 hover:border-brand-300 transition-base"
                    >
                        {action.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SellerDashboardPage;