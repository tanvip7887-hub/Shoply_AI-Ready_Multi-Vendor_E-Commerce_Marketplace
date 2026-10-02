import { useEffect, useState } from "react";
import { orderApi } from "../../api/order.api.js";
import { Package, Truck, CheckCircle2, Clock, MapPin, CreditCard, ArrowRight } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";

const orderStatusBadge = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  READY_TO_SHIP: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PICKUP_CREATED: "bg-amber-100 text-amber-800 border-amber-200",
  OUT_FOR_PICKUP: "bg-amber-100 text-amber-800 border-amber-200",
  PICKED_UP: "bg-cyan-100 text-cyan-800 border-cyan-200",
  IN_TRANSIT: "bg-cyan-100 text-cyan-800 border-cyan-200",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-800 border-sky-200",
  SHIPPED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const paymentStatusBadge = {
  PAID: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-rose-100 text-rose-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const TABS = [
  { key: "ALL", label: "All" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "READY_TO_SHIP", label: "Ready to Ship" },
  { key: "SHIPPED", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const NEXT_ACTION = {
  PENDING: { nextStatus: "CONFIRMED", label: "Confirm Order" },
  CONFIRMED: { nextStatus: "PROCESSING", label: "Accept & Process" },
  PROCESSING: { nextStatus: "READY_TO_SHIP", label: "Mark Ready to Ship" },
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

const SellerOrdersListPage = () => {
  const [activeTab, setActiveTab] = useState("ALL");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = (tab = activeTab) => {
    setIsLoading(true);
    Promise.all([
      orderApi.getSellerOrders(tab),
      orderApi.getSellerDashboard(),
    ])
      .then(([ordersRes, statsRes]) => {
        setOrders(ordersRes.data || []);
        setStats(statsRes.data || null);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load orders");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await orderApi.updateOrderStatusBySeller(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      fetchOrders(activeTab);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <p className="text-sm text-gray-500">View and manage fulfillment workflow for your orders.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Package} label="Total Orders" value={stats?.totalOrders || 0} isLoading={isLoading} />
        <StatCard icon={Clock} label="Pending" value={stats?.pendingOrders || 0} isLoading={isLoading} />
        <StatCard icon={Package} label="Processing" value={(stats?.confirmedOrders || 0) + (stats?.processingOrders || 0)} isLoading={isLoading} />
        <StatCard icon={Truck} label="Ready / Shipped" value={(stats?.readyToShipOrders || 0) + (stats?.shippedOrders || 0)} isLoading={isLoading} />
        <StatCard icon={CheckCircle2} label="Delivered" value={stats?.deliveredOrders || 0} isLoading={isLoading} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID / Date</th>
                <th className="px-6 py-4 font-medium">Delivery Info</th>
                <th className="px-6 py-4 font-medium">Products / Qty</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Fulfillment Status</th>
                <th className="px-6 py-4 font-medium">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-medium text-gray-700">No orders found</p>
                    <p className="text-xs text-gray-400 mt-1">There are no orders matching status "{activeTab}".</p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                orders.map((order) => {
                  const addr = order.shippingAddress || {};
                  const nextAction = NEXT_ACTION[order.orderStatus];
                  const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Order ID / Date */}
                      <td className="px-6 py-4 align-top">
                        <p className="font-bold text-gray-900">#{order.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Delivery Info */}
                      <td className="px-6 py-4 align-top max-w-xs">
                        <p className="font-semibold text-gray-900">{order.user?.name || addr.fullName || "Customer"}</p>
                        <p className="text-xs text-gray-600 flex items-start gap-1 mt-1">
                          <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>
                            {addr.addressLine1 ? `${addr.addressLine1}, ` : ""}
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </span>
                        </p>
                        {(addr.phone || order.user?.phone) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            📞 {addr.phone || order.user?.phone}
                          </p>
                        )}
                      </td>

                      {/* Products / Qty */}
                      <td className="px-6 py-4 align-top max-w-xs">
                        <div className="space-y-1.5">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              {item.product?.images?.[0]?.url && (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.productName}
                                  className="w-8 h-8 rounded border border-gray-200 object-cover flex-shrink-0"
                                />
                              )}
                              <div className="text-xs">
                                <p className="font-medium text-gray-800 line-clamp-1">{item.productName}</p>
                                <p className="text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-2 border-t border-gray-100 pt-1">
                          Total Qty: {totalQty}
                        </p>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        <p className="font-bold text-gray-900">₹{order.subtotal || order.totalAmount}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CreditCard size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-600 font-medium">{order.paymentMethod}</span>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${paymentStatusBadge[order.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                          Payment: {order.paymentStatus}
                        </span>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${orderStatusBadge[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Next Action */}
                      <td className="px-6 py-4 align-top whitespace-nowrap">
                        {nextAction ? (
                          <Button
                            size="sm"
                            className="text-xs flex items-center gap-1.5"
                            isLoading={updatingOrderId === order.id}
                            disabled={updatingOrderId === order.id}
                            onClick={() => handleStatusChange(order.id, nextAction.nextStatus)}
                          >
                            <span>{nextAction.label}</span>
                            <ArrowRight size={13} />
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {order.orderStatus === "READY_TO_SHIP"
                              ? "Ready for Pickup"
                              : order.orderStatus === "DELIVERED"
                              ? "Order Delivered"
                              : order.orderStatus === "CANCELLED"
                              ? "Order Cancelled"
                              : "In Transit (Logistics Hand-off)"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerOrdersListPage;
