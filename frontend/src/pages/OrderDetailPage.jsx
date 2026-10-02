import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderApi } from "../api/order.api.js";
import { reviewApi } from "../api/review.api.js";
import { AlertCircle, ShoppingBag, MapPin, Truck, Star, RotateCcw } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import ReviewModal from "../components/common/ReviewModal.jsx";
import ReturnRequestModal from "../components/ReturnRequestModal.jsx";
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

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "READY_TO_SHIP", label: "Ready to Ship" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const STATUS_INDEX_MAP = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  READY_TO_SHIP: 3,
  PICKUP_CREATED: 4,
  OUT_FOR_PICKUP: 4,
  PICKED_UP: 4,
  IN_TRANSIT: 4,
  SHIPPED: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
};

const OrderTimeline = ({ status, shipment }) => {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-600">Placed</span>
        <span className="text-gray-300">→</span>
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">Cancelled</span>
      </div>
    );
  }
  const effectiveStatus = shipment?.shipmentStatus || status;
  const currentIndex = STATUS_INDEX_MAP[effectiveStatus] ?? TIMELINE_STEPS.findIndex((s) => s.key === effectiveStatus);
  return (
    <div className="space-y-4">
      {shipment?.trackingNumber && (
        <div className="flex items-center gap-2 text-xs bg-brand-50 text-brand-800 p-2.5 rounded-lg border border-brand-200">
          <span className="font-semibold">Tracking #:</span>
          <span className="font-mono font-bold">{shipment.trackingNumber}</span>
          <span className="ml-auto font-medium text-brand-700 font-sans">
            Status: {shipment.shipmentStatus.replace(/_/g, " ")}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full font-medium ${i <= currentIndex ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"}`}>
              {step.label}
            </span>
            {i < TIMELINE_STEPS.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review states
  const [reviewStatusMap, setReviewStatusMap] = useState({});
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Return states
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchReviewStatus = (orderId) => {
    reviewApi
      .getOrderReviewStatus(orderId)
      .then((res) => {
        const map = {};
        const items = res.data?.data || res.data || [];
        items.forEach((item) => {
          map[item.orderItemId] = item;
        });
        setReviewStatusMap(map);
      })
      .catch(() => {});
  };

  const fetchOrder = () => {
    setIsLoading(true);
    orderApi.getMyOrderById(id)
      .then((res) => {
        setOrder(res.data);
        if (res.data?.orderStatus === "DELIVERED") {
          fetchReviewStatus(res.data.id);
        }
      })
      .catch((err) => setError(err.message || "Failed to load order"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setIsCancelling(true);
    try {
      await orderApi.cancelOrder(id);
      toast.success("Order cancelled successfully");
      fetchOrder();
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-24 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || "Order not found"}</p>
          <Link to="/orders" className="mt-4 text-brand-600 underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress;
  const canCancel = order.orderStatus === "PENDING" || order.orderStatus === "CONFIRMED";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-sm text-gray-500 hover:text-brand-600 mb-6 inline-block">
        ← Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.id}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${orderStatusColor[order.orderStatus]}`}>
              {order.orderStatus}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        
        {canCancel && (
          <Button variant="danger" onClick={handleCancel} disabled={isCancelling}>
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={20} className="text-brand-500" /> Order Status
            </h2>
            <OrderTimeline status={order.orderStatus} shipment={order.shipment} />
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-brand-500" /> Items in this Order
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => {
                const statusInfo = reviewStatusMap[item.id];
                const isDelivered = order.orderStatus === "DELIVERED";

                return (
                  <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag size={32} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId}`} className="font-medium text-brand-600 hover:underline">
                        {item.productName}
                      </Link>
                      <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                        <p>Qty: {item.quantity}</p>
                        {item.product?.sku && <p>SKU: {item.product.sku}</p>}
                        <p>Sold By: <span className="font-medium text-gray-900">{order.seller?.businessName}</span></p>
                      </div>

                      {/* Review & Return Action section for DELIVERED orders */}
                      {isDelivered && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {statusInfo?.isReviewed ? (
                            <div className="inline-flex flex-col gap-1 p-2 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                              <div className="flex items-center gap-1 font-bold text-amber-700">
                                <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                                  Reviewed <Star size={10} fill="currentColor" /> {statusInfo.review?.rating}
                                </span>
                              </div>
                              {statusInfo.review?.comment && (
                                <p className="text-gray-600 italic">"{statusInfo.review.comment}"</p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedItemForReview(item);
                                setIsReviewModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-semibold rounded-lg border border-brand-200 transition-colors"
                            >
                              <Star size={14} className="text-amber-500 fill-amber-500" /> Write a Review
                            </button>
                          )}

                          {/* Return item logic */}
                          {(() => {
                            const req = item.returnRequest;
                            const isCancelled = req?.status === "CANCELLED";
                            const hasActiveReturn = req && !isCancelled;

                            const deliveredDate = new Date(order.shipment?.deliveredAt || order.updatedAt || order.createdAt);
                            const now = new Date();
                            const diffDays = (now - deliveredDate) / (1000 * 60 * 60 * 24);
                            const isEligibleWindow = diffDays <= 7;

                            return (
                              <div className="flex flex-col gap-2 w-full mt-2">
                                {hasActiveReturn && (
                                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-1.5 text-gray-800">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 font-bold">
                                        <RotateCcw size={15} className="text-indigo-600 shrink-0" />
                                        <span>Return Status:</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${RETURN_STATUS_BADGE[req.status] || "bg-indigo-100 text-indigo-800"}`}>
                                          {getReturnStatusText(req.status)}
                                        </span>
                                      </div>
                                      {req.refundAmount && (
                                        <span className="font-semibold text-gray-700">
                                          Refund Amount: <strong className="text-gray-900 font-bold">₹{req.refundAmount}</strong>
                                        </span>
                                      )}
                                    </div>

                                    {req.reason && (
                                      <p className="text-gray-600">
                                        <span className="font-semibold text-gray-700">Reason:</span> {req.reason.replace(/_/g, " ")}
                                        {req.comment && <span className="italic ml-1">("{req.comment}")</span>}
                                      </p>
                                    )}

                                    {req.returnShipment && (
                                      <p className="text-gray-600 flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">Pickup Tracking:</span>
                                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{req.returnShipment.trackingNumber}</span>
                                        <span className="text-indigo-700 font-medium">({req.returnShipment.shipmentStatus.replace(/_/g, " ")})</span>
                                      </p>
                                    )}

                                    {req.refund && (
                                      <div className="flex items-center gap-2 pt-1 border-t border-indigo-100/80">
                                        <span className="font-semibold text-gray-700">Refund Status:</span>
                                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold border border-green-200 text-[11px]">
                                          {req.refund.status}
                                        </span>
                                        {req.refund.transactionReference && (
                                          <span className="text-[11px] font-mono text-gray-500">Ref: {req.refund.transactionReference}</span>
                                        )}
                                      </div>
                                    )}

                                    {req.status === "RETURN_REJECTED" && req.rejectionReason && (
                                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 font-medium mt-1">
                                        Rejection Reason: {req.rejectionReason}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {isCancelled && (
                                  <div className="inline-flex items-center gap-2 p-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700 w-fit">
                                    <RotateCcw size={14} className="text-gray-500" />
                                    <span>Return Status: <strong className="font-semibold">Return Cancelled</strong></span>
                                  </div>
                                )}

                                {(!hasActiveReturn && isEligibleWindow) && (
                                  <button
                                    onClick={() => {
                                      setSelectedItemForReturn(item);
                                      setIsReturnModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg border border-gray-300 transition-colors w-fit"
                                  >
                                    <RotateCcw size={14} className="text-gray-600" /> Return Item
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">₹{item.subtotal}</p>
                      {item.quantity > 1 && <p className="text-xs text-gray-500">₹{item.price} each</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Price Details</h2>
            <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{order.shippingCharge}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Discount</span>
                <span>- ₹{order.discount}</span>
              </div>
            </div>
            <div className="flex justify-between items-center font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
              <p><span className="text-gray-500">Payment Method:</span> {order.paymentMethod}</p>
              <p className="mt-1"><span className="text-gray-500">Payment Status:</span> <span className="font-medium">{order.paymentStatus}</span></p>
            </div>
          </div>

          {/* Address Snapshot */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-brand-500" /> Delivery Address
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">{addr?.fullName}</p>
              <p>{addr?.addressLine1}</p>
              {addr?.addressLine2 && <p>{addr?.addressLine2}</p>}
              <p>{addr?.city}, {addr?.state} - {addr?.postalCode}</p>
              <p className="mt-2 text-gray-500">Phone: {addr?.phone}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedItemForReview(null);
        }}
        item={selectedItemForReview}
        orderId={order.id}
        onSuccess={() => fetchReviewStatus(order.id)}
      />

      {/* Return Request Modal */}
      {isReturnModalOpen && selectedItemForReturn && (
        <ReturnRequestModal
          orderItem={selectedItemForReturn}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedItemForReturn(null);
          }}
          onSuccess={() => {
            toast.success("Return request submitted successfully!");
            fetchOrder();
          }}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
