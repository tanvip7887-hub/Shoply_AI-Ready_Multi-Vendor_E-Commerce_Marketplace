import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminApi } from "../../api/admin.api.js";

const orderStatusColor = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const TIMELINE_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const OrderTimeline = ({ status }) => {
    if (status === "CANCELLED") {
        return (
            <div className="flex items-center gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600">Placed</span>
                <span className="text-gray-300">→</span>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">Cancelled</span>
            </div>
        );
    }
    const currentIndex = TIMELINE_STEPS.indexOf(status);
    return (
        <div className="flex items-center gap-2 text-sm flex-wrap">
            {TIMELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-medium ${i <= currentIndex ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                        {step === "PENDING" ? "Placed" : step.charAt(0) + step.slice(1).toLowerCase()}
                    </span>
                    {i < TIMELINE_STEPS.length - 1 && <span className="text-gray-300">→</span>}
                </div>
            ))}
        </div>
    );
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        adminApi.getOrderById(id).then((res) => setOrder(res.data)).catch(() => { }).finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="text-gray-500">Loading...</div>;
    if (!order) return <div className="text-gray-500">Order not found.</div>;

    const addr = order.shippingAddress;

    return (
        <div className="max-w-4xl">
            <Link to="/admin/orders" className="text-sm text-gray-400 hover:text-brand-600 mb-4 inline-block">
                ← Back to Orders
            </Link>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatusColor[order.orderStatus]}`}>
                    {order.orderStatus}
                </span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <h2 className="font-semibold mb-4">Order Timeline</h2>
                <OrderTimeline status={order.orderStatus} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold mb-3">Customer</h2>
                    <p className="text-sm text-gray-600">{order.user?.name}</p>
                    <p className="text-sm text-gray-500">{order.user?.email}</p>
                    <Link to={`/admin/customers/${order.userId}`} className="text-brand-600 text-xs font-semibold hover:underline mt-2 inline-block">
                        View Customer
                    </Link>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold mb-3">Seller</h2>
                    <p className="text-sm text-gray-600">{order.seller?.businessName}</p>
                    <p className="text-sm text-gray-500">{order.seller?.ownerName}</p>
                    <Link to={`/admin/sellers/${order.sellerId}`} className="text-brand-600 text-xs font-semibold hover:underline mt-2 inline-block">
                        View Seller
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <h2 className="font-semibold mb-3">Shipping Address</h2>
                <p className="text-sm text-gray-600">
                    {addr?.fullName}, {addr?.phone}<br />
                    {addr?.addressLine1}{addr?.addressLine2 && `, ${addr.addressLine2}`}<br />
                    {addr?.city}, {addr?.state} - {addr?.postalCode}, {addr?.country}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <h2 className="font-semibold mb-3">Ordered Products</h2>
                <table className="w-full text-sm">
                    <thead className="text-gray-400 text-left border-b border-gray-100">
                        <tr>
                            <th className="pb-2">Product</th>
                            <th className="pb-2">Quantity</th>
                            <th className="pb-2">Unit Price</th>
                            <th className="pb-2">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50 last:border-0">
                                <td className="py-2.5">{item.productName}</td>
                                <td className="py-2.5">{item.quantity}</td>
                                <td className="py-2.5">₹{item.price}</td>
                                <td className="py-2.5 font-medium">₹{item.subtotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold mb-3">Order Summary</h2>
                    <div className="text-sm space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>₹{order.shippingCharge}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-₹{order.discount}</span></div>
                        <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-100">
                            <span>Grand Total</span><span>₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold mb-3">Payment</h2>
                    <p className="text-sm"><span className="text-gray-500">Method:</span> {order.paymentMethod}</p>
                    <p className="text-sm mt-1"><span className="text-gray-500">Status:</span> {order.paymentStatus}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;