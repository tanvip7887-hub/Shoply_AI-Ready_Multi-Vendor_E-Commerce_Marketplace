import { useEffect, useState } from "react";
import { deliveryApi } from "../../api/delivery.api.js";
import { getMyReturnShipments, updateReturnPickupStatus } from "../../api/return.api.js";
import { Package, RotateCcw, Truck, MapPin, Store, CreditCard, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";

const shipmentStatusBadge = {
  PICKUP_CREATED: "bg-amber-100 text-amber-800 border-amber-200",
  OUT_FOR_PICKUP: "bg-blue-100 text-blue-800 border-blue-200",
  PICKED_UP: "bg-purple-100 text-purple-800 border-purple-200",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-800 border-sky-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
};

const OUTBOUND_TABS = [
  { key: "ALL", label: "All" },
  { key: "PICKUP_CREATED", label: "Assigned" },
  { key: "OUT_FOR_PICKUP", label: "Out for Pickup" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const NEXT_OUTBOUND_ACTION = {
  PICKUP_CREATED: { nextStatus: "OUT_FOR_PICKUP", label: "Start Pickup" },
  OUT_FOR_PICKUP: { nextStatus: "PICKED_UP", label: "Mark Picked Up" },
  PICKED_UP: { nextStatus: "IN_TRANSIT", label: "Mark In Transit" },
  IN_TRANSIT: { nextStatus: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  OUT_FOR_DELIVERY: { nextStatus: "DELIVERED", label: "Mark Delivered" },
};

const NEXT_RETURN_ACTION = {
  PICKUP_CREATED: { nextStatus: "PICKED_UP", label: "Mark Picked Up" },
  PICKED_UP: { nextStatus: "DELIVERED", label: "Mark Delivered" },
};

const DeliveryMyShipmentsPage = () => {
  const [shipmentType, setShipmentType] = useState("OUTBOUND"); // "OUTBOUND" | "RETURNS"
  const [activeOutboundTab, setActiveOutboundTab] = useState("ALL");
  const [outboundShipments, setOutboundShipments] = useState([]);
  const [returnShipments, setReturnShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMyShipments = () => {
    setIsLoading(true);
    if (shipmentType === "OUTBOUND") {
      deliveryApi
        .getMyShipments(activeOutboundTab)
        .then((res) => {
          setOutboundShipments(res.data || []);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load assigned outbound shipments");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getMyReturnShipments()
        .then((res) => {
          setReturnShipments(res.data || []);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load assigned return shipments");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchMyShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentType, activeOutboundTab]);

  const handleOutboundStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await deliveryApi.updateShipmentStatus(id, newStatus);
      toast.success(`Outbound shipment updated to ${newStatus.replace(/_/g, " ")}`);
      fetchMyShipments();
    } catch (err) {
      toast.error(err.message || "Failed to update shipment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReturnStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateReturnPickupStatus(id, newStatus);
      toast.success(`Return shipment updated to ${newStatus.replace(/_/g, " ")}`);
      fetchMyShipments();
    } catch (err) {
      toast.error(err.message || "Failed to update return shipment status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
          <p className="text-sm text-gray-500">
            Manage your claimed shipments and return pickups end-to-end.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 self-start sm:self-auto"
          onClick={fetchMyShipments}
        >
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Main Shipment Type Toggle */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3 gap-3 overflow-x-auto">
        <button
          onClick={() => setShipmentType("OUTBOUND")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            shipmentType === "OUTBOUND"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Package size={16} />
          <span>Outbound Shipments</span>
          {outboundShipments.length > 0 && shipmentType === "OUTBOUND" && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-100 text-brand-700">
              {outboundShipments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setShipmentType("RETURNS")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            shipmentType === "RETURNS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <RotateCcw size={16} />
          <span>My Return Shipments</span>
          {returnShipments.length > 0 && shipmentType === "RETURNS" && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">
              {returnShipments.length}
            </span>
          )}
        </button>
      </div>

      {/* Sub-tabs for Outbound Shipments */}
      {shipmentType === "OUTBOUND" && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 pt-2 flex gap-2 overflow-x-auto -mt-6">
          {OUTBOUND_TABS.map((tab) => {
            const isActive = activeOutboundTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveOutboundTab(tab.key)}
                className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-brand-600 text-brand-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {shipmentType === "OUTBOUND" ? (
            /* OUTBOUND SHIPMENTS TABLE */
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Tracking / Order</th>
                  <th className="px-6 py-4 font-medium">Pickup (Seller)</th>
                  <th className="px-6 py-4 font-medium">Destination (Customer)</th>
                  <th className="px-6 py-4 font-medium">Payment / Value</th>
                  <th className="px-6 py-4 font-medium">Shipment Status</th>
                  <th className="px-6 py-4 font-medium">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <Skeleton className="h-16 w-full" />
                      </td>
                    </tr>
                  ))}

                {!isLoading && outboundShipments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-700">No outbound shipments found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        No assigned shipments matching status "{activeOutboundTab}".
                      </p>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  outboundShipments.map((shipment) => {
                    const order = shipment.order || {};
                    const seller = order.seller || {};
                    const sellerAddr = seller.sellerAddress || {};
                    const destAddr = order.shippingAddress || {};
                    const nextAction = NEXT_OUTBOUND_ACTION[shipment.shipmentStatus];

                    return (
                      <tr key={shipment.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Tracking / Order */}
                        <td className="px-6 py-4 align-top">
                          <span className="inline-block font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            {shipment.trackingNumber}
                          </span>
                          <p className="font-bold text-gray-900 mt-1">Order #{order.id}</p>
                          {shipment.pickedUpAt && (
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Picked Up: {new Date(shipment.pickedUpAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          {shipment.deliveredAt && (
                            <p className="text-[10px] text-green-600 font-medium mt-0.5">
                              Delivered: {new Date(shipment.deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </td>

                        {/* Pickup (Seller) */}
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <Store size={14} className="text-brand-600 shrink-0" />
                            <span>{seller.businessName || "Seller Store"}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {sellerAddr.addressLine1 ? `${sellerAddr.addressLine1}, ` : ""}
                            {sellerAddr.city}, {sellerAddr.state} - {sellerAddr.postalCode}
                          </p>
                          {seller.mobileNumber && (
                            <p className="text-xs text-gray-500 mt-0.5">📞 {seller.mobileNumber}</p>
                          )}
                        </td>

                        {/* Destination (Customer) */}
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <MapPin size={14} className="text-red-500 shrink-0" />
                            <span>{order.user?.name || destAddr.fullName || "Customer"}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {destAddr.addressLine1 ? `${destAddr.addressLine1}, ` : ""}
                            {destAddr.city}, {destAddr.state} - {destAddr.postalCode}
                          </p>
                          {(destAddr.phone || order.user?.phone) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              📞 {destAddr.phone || order.user?.phone}
                            </p>
                          )}
                        </td>

                        {/* Payment / Value */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <CreditCard size={12} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-700">
                              {order.paymentMethod} ({order.paymentStatus})
                            </span>
                          </div>
                        </td>

                        {/* Shipment Status */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              shipmentStatusBadge[shipment.shipmentStatus] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {shipment.shipmentStatus.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Next Action */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          {nextAction ? (
                            <Button
                              size="sm"
                              className="text-xs flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white"
                              isLoading={updatingId === shipment.id}
                              disabled={updatingId === shipment.id}
                              onClick={() => handleOutboundStatusUpdate(shipment.id, nextAction.nextStatus)}
                            >
                              <span>{nextAction.label}</span>
                              <ArrowRight size={13} />
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 size={13} /> Delivered
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            /* RETURN SHIPMENTS TABLE */
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-gray-500 text-left border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Tracking / Return & Order</th>
                  <th className="px-6 py-4 font-medium">Pickup (Customer)</th>
                  <th className="px-6 py-4 font-medium">Destination (Seller Hub)</th>
                  <th className="px-6 py-4 font-medium">Item & Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <Skeleton className="h-16 w-full" />
                      </td>
                    </tr>
                  ))}

                {!isLoading && returnShipments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <RotateCcw className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-700">No claimed return shipments</p>
                      <p className="text-xs text-gray-400 mt-1">
                        You have not claimed any return pickups yet.
                      </p>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  returnShipments.map((shipment) => {
                    const req = shipment.returnRequest || {};
                    const customer = req.customer || {};
                    const seller = req.seller || {};
                    const sellerAddr = seller.sellerAddress || {};
                    const pickupAddr = req.order?.shippingAddress || {};
                    const item = req.orderItem || {};
                    const product = req.product || {};
                    const nextAction = NEXT_RETURN_ACTION[shipment.shipmentStatus];

                    return (
                      <tr key={shipment.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Tracking / Return & Order */}
                        <td className="px-6 py-4 align-top">
                          <span className="inline-block font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {shipment.trackingNumber}
                          </span>
                          <p className="font-bold text-gray-900 mt-1">
                            Order #{req.orderId} • Return #{req.id}
                          </p>
                          {shipment.pickedUpAt && (
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Picked Up: {new Date(shipment.pickedUpAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          {shipment.deliveredAt && (
                            <p className="text-[10px] text-green-600 font-medium mt-0.5">
                              Delivered to Seller: {new Date(shipment.deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </td>

                        {/* Pickup (Customer) */}
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <MapPin size={14} className="text-indigo-600 shrink-0" />
                            <span>{customer.name || pickupAddr.fullName || "Customer"}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {pickupAddr.addressLine1 ? `${pickupAddr.addressLine1}, ` : ""}
                            {pickupAddr.city}, {pickupAddr.state} - {pickupAddr.postalCode}
                          </p>
                          {(customer.phone || pickupAddr.phone) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              📞 {customer.phone || pickupAddr.phone}
                            </p>
                          )}
                        </td>

                        {/* Destination (Seller Hub) */}
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="font-semibold text-gray-900 flex items-center gap-1">
                            <Store size={14} className="text-gray-600 shrink-0" />
                            <span>{seller.businessName || "Seller Store"}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {sellerAddr.addressLine1 ? `${sellerAddr.addressLine1}, ` : ""}
                            {sellerAddr.city}, {sellerAddr.state} - {sellerAddr.postalCode}
                          </p>
                          {seller.mobileNumber && (
                            <p className="text-xs text-gray-500 mt-0.5">📞 {seller.mobileNumber}</p>
                          )}
                        </td>

                        {/* Item & Reason */}
                        <td className="px-6 py-4 align-top max-w-xs">
                          <p className="font-bold text-gray-900 truncate">
                            {item.productName || product.name || "Item"}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Qty: {item.quantity || 1} • Refund: <span className="font-bold text-gray-800">₹{req.refundAmount}</span>
                          </p>
                          <p className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block font-medium border border-indigo-100">
                            Reason: {req.reason ? req.reason.replace(/_/g, " ") : "Return Request"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                shipmentStatusBadge[shipment.shipmentStatus] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              Shipment: {shipment.shipmentStatus.replace(/_/g, " ")}
                            </span>
                            <br />
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              Return: {req.status}
                            </span>
                          </div>
                        </td>

                        {/* Next Action */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          {nextAction ? (
                            <Button
                              size="sm"
                              className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                              isLoading={updatingId === shipment.id}
                              disabled={updatingId === shipment.id}
                              onClick={() => handleReturnStatusUpdate(shipment.id, nextAction.nextStatus)}
                            >
                              <span>{nextAction.label}</span>
                              <ArrowRight size={13} />
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 size={13} /> Delivered to Seller
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryMyShipmentsPage;
