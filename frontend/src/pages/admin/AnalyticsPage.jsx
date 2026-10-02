import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { adminApi } from "../../api/admin.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";

const CardGroup = ({ title, cards }) => (
    <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
            ))}
        </div>
    </div>
);

const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        adminApi.getAnalytics().then((res) => setData(res.data)).catch(() => { }).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        );
    }
    if (!data) return <div className="text-gray-500">Failed to load analytics.</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics</h1>
            <p className="text-sm text-gray-400 mb-6">Marketplace performance overview</p>

            <CardGroup title="Sales" cards={[
                { label: "Total Revenue", value: `₹${data.revenue.total}` },
                { label: "Today's Revenue", value: `₹${data.revenue.today}` },
                { label: "This Month", value: `₹${data.revenue.thisMonth}` },
                { label: "Avg Order Value", value: `₹${data.revenue.avgOrderValue}` },
            ]} />

            <CardGroup title="Orders" cards={[
                { label: "Total Orders", value: data.orders.total },
                { label: "Pending", value: data.orders.pending },
                { label: "Delivered", value: data.orders.delivered },
                { label: "Cancelled", value: data.orders.cancelled },
            ]} />

            <CardGroup title="Customers" cards={[
                { label: "Total Customers", value: data.customers.total },
                { label: "New Today", value: data.customers.newToday },
                { label: "Blocked", value: data.customers.blocked },
            ]} />

            <CardGroup title="Sellers" cards={[
                { label: "Verified Sellers", value: data.sellers.verified },
                { label: "Pending Applications", value: data.sellers.pendingApplications },
                { label: "Suspended", value: data.sellers.suspended },
                { label: "New This Month", value: data.sellers.newThisMonth },
            ]} />

            <CardGroup title="Products" cards={[
                { label: "Total Products", value: data.products.total },
                { label: "Out of Stock", value: data.products.outOfStock },
                { label: "Categories", value: data.products.categories },
                { label: "Brands", value: data.products.brands },
            ]} />

            <CardGroup title="Payments" cards={[
                { label: "COD Orders", value: data.payments.cod },
                { label: "Online Orders", value: data.payments.online },
                { label: "Failed", value: data.payments.failed },
                { label: "Refunded", value: data.payments.refunded },
            ]} />

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (30 days)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#570D48" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Orders per Day (7 days)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.ordersTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#570D48" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Top Products</h3>
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 text-left border-b border-gray-100">
                            <tr><th className="pb-2">Product</th><th className="pb-2">Orders</th><th className="pb-2">Revenue</th></tr>
                        </thead>
                        <tbody>
                            {data.topProducts.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">No data yet</td></tr>}
                            {data.topProducts.map((p, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2">{p.name}</td><td className="py-2">{p.orders}</td><td className="py-2">₹{p.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Top Sellers</h3>
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 text-left border-b border-gray-100">
                            <tr><th className="pb-2">Seller</th><th className="pb-2">Orders</th><th className="pb-2">Revenue</th></tr>
                        </thead>
                        <tbody>
                            {data.topSellers.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">No data yet</td></tr>}
                            {data.topSellers.map((s, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2">{s.name}</td><td className="py-2">{s.orders}</td><td className="py-2">₹{s.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Top Categories</h3>
                    <table className="w-full text-sm">
                        <thead className="text-gray-400 text-left border-b border-gray-100">
                            <tr><th className="pb-2">Category</th><th className="pb-2">Orders</th><th className="pb-2">Revenue</th></tr>
                        </thead>
                        <tbody>
                            {data.topCategories.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">No data yet</td></tr>}
                            {data.topCategories.map((c, i) => (
                                <tr key={i} className="border-b border-gray-50 last:border-0">
                                    <td className="py-2">{c.name}</td><td className="py-2">{c.orders}</td><td className="py-2">₹{c.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;