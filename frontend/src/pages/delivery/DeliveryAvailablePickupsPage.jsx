import { useEffect, useState } from "react";
import { deliveryApi } from "../../api/delivery.api.js";
import { getAvailableReturnPickups, acceptReturnPickup } from "../../api/return.api.js";
import { Package, MapPin, Store, CreditCard, ArrowRight, RefreshCw, RotateCcw } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";

const DeliveryAvailablePickupsPage = () => {
  const [pickupType, setPickupType] = useState("OUTBOUND"); // "OUTBOUND" | "RETURNS"
  const [outboundShipments, setOutboundShipments] = useState([]);
  const [returnShipments, setReturnShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  const fetchAvailable = () => {
    setIsLoading(true);
    if (pickupType === "OUTBOUND") {
      deliveryApi
        .getAvailablePickups()
        .then((res) => {
          setOutboundShipments(res.data || []);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load available outbound pickups");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      getAvailableReturnPickups()
        .then((res) => {
          setReturnShipments(res.data || []);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load available return pickups");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, [pickupType]);

  const handleAcceptOutbound = async (id) => {
    setClaimingId(id);
    try {
      await deliveryApi.acceptShipment(id);
      toast.success("Outbound pickup claimed successfully! Added to My Shipments.");
      fetchAvailable();
    } catch (err) {
      toast.error(err.message || "Failed to accept shipment");
    } finally {
      setClaimingId(null);
    }
  };

  const handleAcceptReturn = async (id) => {
    setClaimingId(id);
    try {
      await acceptReturnPickup(id);
      toast.success("Return pickup claimed successfully!");
      fetchAvailable();
    } catch (err) {
      toast.error(err.message || "Failed to accept return pickup");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Pickups</h1>
          <p className="text-sm text-gray-500">
            Browse and claim unassigned pickup requests ready for fulfillment.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 self-start sm:self-auto"
          onClick={fetchAvailable}
        >
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Pickup Type Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3 gap-3 overflow-x-auto">
        <button
          onClick={() => setPickupType("OUTBOUND")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            pickupType === "OUTBOUND"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Package size={16} />
          <span>Outbound Pickups (Seller → Customer)</span>
          {outboundShipments.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-100 text-brand-700">
              {outboundShipments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setPickupType("RETURNS")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            pickupType === "RETURNS"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <RotateCcw size={16} />
          <span>Return Pickups (Customer → Seller)</span>
          {returnShipments.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">
              {returnShipments.length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {pickupType === "OUTBOUND" ? (
            /* OUTBOUND PICKUPS TABLE */
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Tracking / Order</th>
                  <th className="px-6 py-4 font-medium">Pickup (Seller)</th>
                  <th className="px-6 py-4 font-medium">Destination (Customer)</th>
                  <th className="px-6 py-4 font-medium">Payment / Value</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <Skeleton className="h-16 w-full" />
                      </td>
                    </tr>
                  ))}

                {!isLoading && outboundShipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-700">No available outbound pickups</p>
                      <p className="text-xs text-gray-400 mt-1">
                        There are currently no unclaimed orders waiting for pickup.
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

                    return (
                      <tr key={shipment.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Tracking / Order */}
                        <td className="px-6 py-4 align-top">
                          <span className="inline-block font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            {shipment.trackingNumber}
                          </span>
                          <p className="font-bold text-gray-900 mt-1">Order #{order.id}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(shipment.createdAt).toLocaleDateString()}
                          </p>
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

                        {/* Action */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          <Button
                            size="sm"
                            className="text-xs flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white"
                            isLoading={claimingId === shipment.id}
                            disabled={claimingId === shipment.id}
                            onClick={() => handleAcceptOutbound(shipment.id)}
                          >
                            <span>Accept Pickup</span>
                            <ArrowRight size={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            /* RETURN PICKUPS TABLE */
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-gray-500 text-left border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Tracking / Return & Order</th>
                  <th className="px-6 py-4 font-medium">Pickup (Customer)</th>
                  <th className="px-6 py-4 font-medium">Destination (Seller Hub)</th>
                  <th className="px-6 py-4 font-medium">Item & Reason</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <Skeleton className="h-16 w-full" />
                      </td>
                    </tr>
                  ))}

                {!isLoading && returnShipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <RotateCcw className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-700">No available return pickups</p>
                      <p className="text-xs text-gray-400 mt-1">
                        There are currently no unclaimed customer returns waiting for pickup.
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
                          <p className="text-xs text-gray-500">
                            {new Date(shipment.createdAt).toLocaleDateString()}
                          </p>
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

                        {/* Action */}
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                          <Button
                            size="sm"
                            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                            isLoading={claimingId === shipment.id}
                            disabled={claimingId === shipment.id}
                            onClick={() => handleAcceptReturn(shipment.id)}
                          >
                            <span>Accept Return Pickup</span>
                            <ArrowRight size={13} />
                          </Button>
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

export default DeliveryAvailablePickupsPage;

