import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api/order.api.js";
import { ShoppingBag, AlertCircle, RefreshCw, RotateCcw } from "lucide-react";
import Skeleton from "../components/ui/Skeleton.jsx";
import Button from "../components/ui/Button.jsx";
import RazorpayMockModal from "../components/payment/RazorpayMockModal.jsx";
import { useDispatch, useSelector } from "react-redux";
import { createMockPayment, verifyMockPayment, clearPaymentState } from "../store/slices/paymentSlice.js";
import toast from "react-hot-toast";
import { getReturnStatusText, RETURN_STATUS_BADGE } from "../utils/returnStatus.js";

const orderStatusColor = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  READY_TO_SHIP: "bg-indigo-100 text-indigo-700",
  PICKUP_CREATED: "bg-amber-100 text-amber-700",
  OUT_FOR_PICKUP: "bg-amber-100 text-amber-700",
  PICKED_UP: "bg-cyan-100 text-cyan-700",
  IN_TRANSIT: "bg-cyan-100 text-cyan-700",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);
  const dispatch = useDispatch();
  const { paymentDetails, isProcessing } = useSelector((state) => state.payment);

  const fetchOrders = () => {
    orderApi.getMyOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message || "Failed to load orders"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRetryPayment = async (orderId) => {
    try {
      await dispatch(createMockPayment([orderId])).unwrap();
      setShowMockRazorpay(true);
    } catch (err) {
      const errorMsg = typeof err === "string" ? err : err?.message || "Unable to start payment. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleMockCancel = () => {
    setShowMockRazorpay(false);
    dispatch(clearPaymentState());
  };

  const processRetryPayment = async () => {
    try {
      await dispatch(
        verifyMockPayment({ paymentReference: paymentDetails.paymentReference, status: "SUCCESS" })
      ).unwrap();
      
      setShowMockRazorpay(false);
      dispatch(clearPaymentState());
      toast.success("Payment successful!");
      fetchOrders();
    } catch (err) {
      setShowMockRazorpay(false);
      dispatch(clearPaymentState());
      const errorMsg = typeof err === "string" ? err : err?.message || "Payment failed.";
      toast.error(errorMsg);
      fetchOrders();
      throw err;
    }
  };


  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-48 mb-6" />
        {[1, 2, 3].map((n) => <Skeleton key={n} className="h-32 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
        <Link to="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Order Placed</p>
                  <p className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Total</p>
                  <p className="text-gray-900 font-bold">₹{order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Order ID</p>
                  <p className="text-gray-900">#{order.id}</p>
                </div>
                <div>
                   <p className="text-gray-500 font-medium">Seller</p>
                   <p className="text-gray-900">{order.seller?.businessName}</p>
                </div>
              </div>
              <Link to={`/orders/${order.id}`}>
                <Button variant="secondary" className="text-sm">View Details</Button>
              </Link>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1 w-full">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${orderStatusColor[order.orderStatus]}`}>
                    {order.orderStatus}
                  </span>
                  {order.paymentMethod === "ONLINE" && order.paymentStatus === "FAILED" && order.orderStatus === "PENDING" && (
                     <Button 
                       size="sm" 
                       variant="outline"
                       className="text-orange-600 border-orange-600 hover:bg-orange-50 ml-auto flex items-center gap-2"
                       onClick={() => handleRetryPayment(order.id)}
                       isLoading={isProcessing}
                     >
                       <RefreshCw size={14} /> Retry Payment
                     </Button>
                  )}
                </h3>
                
                <div className="space-y-4 mt-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                          {item.product?.images?.[0]?.url ? (
                            <img src={item.product.images[0].url} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={24} />
                          )}
                        </div>
                        <div>
                          <Link to={`/products/${item.productId}`} className="font-medium text-brand-600 hover:underline line-clamp-1">
                            {item.productName}
                          </Link>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold">₹{item.price}</p>
                        </div>
                      </div>

                      {item.returnRequest && (
                        <div className="flex flex-col sm:items-end gap-1 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <RotateCcw size={13} className="text-indigo-600 shrink-0" />
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${RETURN_STATUS_BADGE[item.returnRequest.status] || "bg-indigo-100 text-indigo-800"}`}>
                              {getReturnStatusText(item.returnRequest.status)}
                            </span>
                          </div>
                          {item.returnRequest.status === "RETURN_REJECTED" && item.returnRequest.rejectionReason && (
                            <p className="text-red-700 font-medium mt-0.5">
                              Reason: {item.returnRequest.rejectionReason}
                            </p>
                          )}
                          {item.returnRequest.refund && (
                            <p className="text-gray-700 font-medium">
                              Refund: <span className="font-bold">{item.returnRequest.refund.status}</span> (₹{item.returnRequest.refund.amount})
                            </p>
                          )}
                          <Link to={`/orders/${order.id}`} className="text-indigo-700 font-bold hover:underline mt-1">
                            View Return Details →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showMockRazorpay && paymentDetails && (
        <RazorpayMockModal 
          amount={paymentDetails.totalAmount}
          onConfirmPayment={processRetryPayment}
          onCancel={handleMockCancel}
        />
      )}
    </div>
  );
};

export default OrdersPage;
