import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Store, Users, ShoppingBag, CheckCircle2, Package, FolderTree, BarChart3 } from "lucide-react";
import { adminApi } from "../../api/admin.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";

const statusBadge = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const StatCard = ({ icon: Icon, label, value, subtitle, isLoading }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 transition-base hover:shadow-md hover:-translate-y-0.5">
    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
      <Icon size={20} />
    </div>
    <p className="text-sm text-gray-500">{label}</p>
    {isLoading ? (
      <Skeleton className="h-7 w-16 mt-1" />
    ) : (
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
    )}
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const quickActions = [
  { to: "/admin/seller-applications", icon: FileText, label: "Approve Sellers" },
  { to: "/admin/products", icon: Package, label: "Manage Products" },
  { to: "/admin/categories", icon: FolderTree, label: "Manage Categories" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getDashboard(), adminApi.getApplications(), adminApi.getOrders()])
      .then(([statsRes, appsRes, ordersRes]) => {
        setStats(statsRes.data);
        setApplications(appsRes.data.slice(0, 5));
        setOrders(ordersRes.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todaysOrderCount = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">{greeting} 👋</h2>
        <p className="text-2xl font-bold text-gray-900 mt-1">Welcome back, Admin</p>
        <p className="text-gray-500 text-sm mt-1">
          Monitor sellers, products, customers and orders from one place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Pending Applications" value={stats?.pendingSellerRequests} isLoading={isLoading} />
        <StatCard icon={Store} label="Active Sellers" value={stats?.verifiedSellers} isLoading={isLoading} />
        <StatCard icon={Users} label="Customers" value={stats?.totalUsers} isLoading={isLoading} />
        <StatCard icon={ShoppingBag} label="Today's Orders" value={isLoading ? undefined : todaysOrderCount} isLoading={isLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Seller Applications</h3>
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-left border-b border-gray-100">
              <tr>
                <th className="pb-2 font-medium">Business</th>
                <th className="pb-2 font-medium">Owner</th>
                <th className="pb-2 font-medium">Applied</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="py-2"><Skeleton className="h-5 w-full" /></td></tr>
                ))}
              {!isLoading && applications.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No applications yet</td></tr>
              )}
              {!isLoading &&
                applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-medium text-gray-900">{app.businessName}</td>
                    <td className="py-2.5 text-gray-500">{app.ownerName}</td>
                    <td className="py-2.5 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Link to={`/admin/seller-applications/${app.id}`} className="text-brand-600 text-xs font-semibold hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-left border-b border-gray-100">
              <tr>
                <th className="pb-2 font-medium">Order ID</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Seller</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="py-2"><Skeleton className="h-5 w-full" /></td></tr>
                ))}
              {!isLoading && orders.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No orders yet</td></tr>
              )}
              {!isLoading &&
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-medium text-gray-900">#{order.id}</td>
                    <td className="py-2.5 text-gray-500">{order.user?.name}</td>
                    <td className="py-2.5 text-gray-500">{order.seller?.businessName}</td>
                    <td className="py-2.5 font-medium">₹{order.totalAmount}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col items-center text-center gap-2 transition-base hover:shadow-md hover:-translate-y-0.5 hover:border-brand-300"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;