import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Truck, Package, PackageCheck } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { orderApi } from "../api/order.api.js";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(location.state?.orders || []);

  useEffect(() => {
    if (!orders || orders.length === 0) {
      navigate("/orders", { replace: true });
      return;
    }

    // Check if any order item is missing product image details
    const needsImageFetch = orders.some((o) =>
      o.items?.some((item) => !item.product?.images?.[0]?.url)
    );

    if (needsImageFetch) {
      Promise.all(
        orders.map((o) =>
          orderApi.getMyOrderById(o.id).then((res) => res.data).catch(() => null)
        )
      ).then((freshOrders) => {
        const validOrders = freshOrders.filter(Boolean);
        if (validOrders.length > 0) {
          setOrders(validOrders);
        }
      });
    }
  }, []);

  if (!orders || orders.length === 0) return null;

  // We can display the primary order details, or handle multiple sub-orders.
  // We'll calculate the aggregate totals and use the first order's shared details.
  const primaryOrder = orders[0];
  const { shippingAddress } = primaryOrder;
  
  const aggregateTotal = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const aggregateSubtotal = orders.reduce((sum, order) => sum + Number(order.subtotal), 0);
  const aggregateDelivery = orders.reduce((sum, order) => sum + Number(order.shippingCharge), 0);
  const aggregateDiscount = orders.reduce((sum, order) => sum + Number(order.discount), 0);

  const orderIds = orders.map(o => `#${o.id}`).join(", ");

  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 7);
  const formattedDeliveryDate = expectedDeliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-900 font-medium text-lg mb-2">Your order has been placed successfully.</p>
          <p className="text-gray-500">Thank you for your order. We’ll notify you when your order is shipped.</p>
        </div>

        {/* Order Details & Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Information</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Order ID:</span> {orderIds}</p>
                  <p><span className="font-medium">Payment Method:</span> {primaryOrder.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                  <p>
                    <span className="font-medium">Payment Status:</span>{" "}
                    <span className={`font-medium ${primaryOrder.paymentStatus === "PAID" ? "text-green-600" : "text-orange-600"}`}>
                      {primaryOrder.paymentStatus === "PAID" ? "Paid" : "Pending"}
                    </span>
                    {primaryOrder.paymentStatus === "PAID" && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        ✓ Payment Successful
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</h3>
                <div className="text-sm text-gray-700">
                  <p className="font-bold text-gray-900">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.addressLine1}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Expected Delivery</h3>
                <p className="text-sm text-gray-900 font-bold">{formattedDeliveryDate}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-8 border-gray-100">
               <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Order Status</h3>
               <div className="relative pl-8 space-y-6">
                 <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                 
                 <div className="relative">
                   <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                     <CheckCircle size={14} className="text-white" />
                   </div>
                   <p className="font-bold text-gray-900 text-sm">Order Placed</p>
                   <p className="text-xs text-gray-500">Today</p>
                 </div>
                 
                 <div className="relative">
                   <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center">
                     <Package size={12} className="text-gray-400" />
                   </div>
                   <p className="font-medium text-gray-400 text-sm">Shipped</p>
                   <p className="text-xs text-gray-400">Expected soon</p>
                 </div>
                 
                 <div className="relative">
                   <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center">
                     <Truck size={12} className="text-gray-400" />
                   </div>
                   <p className="font-medium text-gray-400 text-sm">Out for Delivery</p>
                 </div>
                 
                 <div className="relative">
                   <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center">
                     <PackageCheck size={12} className="text-gray-400" />
                   </div>
                   <p className="font-medium text-gray-400 text-sm">Delivered</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Products & Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Ordered Products</h2>
          </div>
          <div className="p-6 space-y-6">
            {orders.flatMap(order => order.items).map((item) => {
              const imageUrl = item.product?.images?.[0]?.url || item.product?.images?.[0] || item.productImage;
              return (
                <div key={item.id} className="flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-md border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={28} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{item.productName}</h4>
                    <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Unit Price: ₹{item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.subtotal}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="max-w-xs ml-auto space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{aggregateSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{aggregateDelivery === 0 ? <span className="text-green-600">FREE</span> : `₹${aggregateDelivery.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{aggregateDiscount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>Total Amount</span>
                <span>₹{aggregateTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button variant="outline" className="w-full sm:w-auto px-8 py-3 bg-white" onClick={() => navigate(orders.length === 1 ? `/orders/${primaryOrder.id}` : "/orders")}>
            Track Order
          </Button>
          <Button className="w-full sm:w-auto px-8 py-3" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationPage;
