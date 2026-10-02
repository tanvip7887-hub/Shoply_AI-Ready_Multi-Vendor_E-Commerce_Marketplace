import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchCheckout } from "../store/slices/checkoutSlice.js";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { MapPin, AlertCircle, ShoppingBag, Plus } from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkoutData, isLoading, error } = useSelector((state) => state.checkout);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  useEffect(() => {
    dispatch(fetchCheckout(selectedAddressId));
  }, [dispatch, selectedAddressId]);

  useEffect(() => {
    if (checkoutData?.selectedAddress?.id && !selectedAddressId) {
      setSelectedAddressId(checkoutData.selectedAddress.id);
    }
  }, [checkoutData, selectedAddressId]);

  const handleContinueToPayment = () => {
    if (!checkoutData?.validation?.isValid) {
      toast.error("Please resolve any errors before continuing.");
      return;
    }
    
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    navigate("/payment", { state: { selectedAddressId } });
  };

  if (isLoading && !checkoutData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="md:col-span-1">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Checkout Error</h2>
          <p>{error}</p>
          <Button onClick={() => dispatch(fetchCheckout(selectedAddressId))} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!checkoutData) return null;

  const { items, selectedAddress, addresses, pricing, validation } = checkoutData;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] pb-12">

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {validation.errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={18} /> Action Required
          </h3>
          <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
            {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={20} className="text-brand-500" /> Delivery Address
              </h2>
              {selectedAddress && (
                <button 
                  onClick={() => setIsChangingAddress(!isChangingAddress)} 
                  className="text-brand-600 text-sm font-medium hover:text-brand-800"
                >
                  {isChangingAddress ? "Cancel" : "Change"}
                </button>
              )}
            </div>

            {!selectedAddress ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-4">No delivery address selected</p>
                <Button onClick={() => navigate("/addresses")}>Add New Address</Button>
              </div>
            ) : (
              <div>
                {!isChangingAddress ? (
                  <div className="bg-brand-50/30 border border-brand-100 rounded-lg p-4 relative">
                    <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                      {selectedAddress.type}
                    </span>
                    <h3 className="font-bold text-gray-900 mb-1">{selectedAddress.fullName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{selectedAddress.phone}</p>
                    <p className="text-sm text-gray-600">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 && <>, {selectedAddress.addressLine2}</>}
                      {selectedAddress.landmark && <><br/>Landmark: {selectedAddress.landmark}</>}
                      <br/>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label 
                        key={addr.id} 
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedAddressId === addr.id ? "border-brand-500 bg-brand-50/10" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="address" 
                          checked={selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            setIsChangingAddress(false);
                          }}
                          className="mt-1 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{addr.fullName}</span>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">{addr.type}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                    <div className="pt-2">
                       <Button variant="secondary" className="w-full text-sm py-2" onClick={() => navigate("/addresses")}>
                         <Plus size={16} className="inline mr-1" /> Add a new address
                       </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Order Items Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShoppingBag size={20} className="text-brand-500" /> Order Items ({items.length})
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className={`flex gap-4 p-4 rounded-lg border ${!item.isAvailable ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                    {item.product.primaryImage ? (
                      <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{item.product.name}</h3>
                    {item.product.brand && <p className="text-xs text-gray-500 mb-1">{item.product.brand}</p>}
                    <p className="text-sm text-gray-600 mb-2">Qty: {item.quantity}</p>
                    
                    {!item.isAvailable && (
                      <p className="text-xs text-red-600 font-semibold bg-red-100 inline-block px-2 py-1 rounded">
                        Currently unavailable ({item.availableStock} in stock)
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.itemSubtotal}</p>
                    {item.quantity > 1 && <p className="text-xs text-gray-500">₹{item.product.price} each</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Price Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Price Details</h2>
            
            <div className="space-y-3 text-sm mb-4 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span>₹{Number(pricing.itemTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Discount</span>
                <span>- ₹{Number(pricing.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="text-brand-600 font-medium">
                  {pricing.deliveryFee === 0 ? "FREE" : `₹${pricing.deliveryFee}`}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center font-bold text-lg text-gray-900 mb-6 border-t border-gray-100 pt-4">
              <span>Total Amount</span>
              <span>₹{Number(pricing.total).toFixed(2)}</span>
            </div>

            <Button 
              className="w-full text-base py-3" 
              disabled={!validation.isValid}
              onClick={handleContinueToPayment}
            >
              Deliver to this address
            </Button>
            
            {!validation.isValid && (
              <p className="text-center text-xs text-red-500 mt-3">
                Cannot place order. Please review the errors above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CheckoutPage;
