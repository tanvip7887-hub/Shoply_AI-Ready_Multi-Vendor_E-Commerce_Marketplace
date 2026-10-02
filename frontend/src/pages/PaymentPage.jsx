import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { fetchCheckout } from "../store/slices/checkoutSlice.js";
import { createOrder } from "../store/slices/orderSlice.js";
import { fetchCart } from "../store/slices/cartSlice.js";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { AlertCircle, CreditCard, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import RazorpayMockModal from "../components/payment/RazorpayMockModal.jsx";
import { createMockPayment, verifyMockPayment, clearPaymentState } from "../store/slices/paymentSlice.js";

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAddressId = location.state?.selectedAddressId;

  const { checkoutData, isLoading, error } = useSelector((state) => state.checkout);
  const { isCreating } = useSelector((state) => state.order);
  const { paymentDetails, isProcessing } = useSelector((state) => state.payment);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);

  useEffect(() => {
    if (!selectedAddressId) {
      toast.error("Please select an address first.");
      navigate("/checkout", { replace: true });
      return;
    }
    dispatch(fetchCheckout());
  }, [dispatch, navigate, selectedAddressId]);

  useEffect(() => {
    if (!isLoading && checkoutData && !checkoutData.validation?.isValid) {
      toast.error("Your cart has changed. Please review your order again.");
      navigate("/checkout", { replace: true });
    }
  }, [checkoutData, isLoading, navigate]);

  const handleContinue = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (paymentMethod === "COD") {
      try {
        const createdOrders = await dispatch(createOrder({ addressId: selectedAddressId, paymentMethod })).unwrap();
        dispatch(fetchCart()); // Refresh cart badge to 0
        navigate("/order-confirmation", { state: { orders: createdOrders } });
      } catch (err) {
        toast.error(err || "Unable to place the order. Please try again.");
      }
    } else {
      // ONLINE PAYMENT: Just open the modal. Do NOT create the order yet.
      setShowMockRazorpay(true);
    }
  };

  const processOnlinePayment = async () => {
    try {
      // 1. Create the order now
      const createdOrders = await dispatch(createOrder({ addressId: selectedAddressId, paymentMethod: "ONLINE" })).unwrap();
      dispatch(fetchCart()); // Refresh cart badge to 0

      // 2. Create the mock payment
      const orderIds = createdOrders.map(o => o.id);
      const paymentData = await dispatch(createMockPayment(orderIds)).unwrap();

      // 3. Verify as SUCCESS
      const updatedOrders = await dispatch(verifyMockPayment({ paymentReference: paymentData.paymentReference, status: "SUCCESS" })).unwrap();
      
      setShowMockRazorpay(false);
      dispatch(clearPaymentState());
      navigate("/order-confirmation", { state: { orders: updatedOrders } });
    } catch (err) {
      const errorMsg = typeof err === "string" ? err : err?.message || "Payment failed. Please try again or check your orders.";
      toast.error(errorMsg);
      setShowMockRazorpay(false);
      dispatch(clearPaymentState());
      navigate("/orders");
      throw err; // Re-throw to let the modal know it failed
    }
  };

  const handleMockCancel = () => {
    setShowMockRazorpay(false);
    dispatch(clearPaymentState());
    // Order was never created, so we just close the modal. No cancellation logic needed here.
  };

  if (isLoading && !checkoutData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="md:col-span-1">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error || "Could not load payment details."}</p>
        <Button onClick={() => navigate("/checkout")}>Back to Checkout</Button>
      </div>
    );
  }

  const { pricing } = checkoutData;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-140px)] pb-12">

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
              Select Payment Method
            </h2>

            <div className="space-y-3">
              <label 
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "COD" ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"
                }`}
              >
                <div className="mt-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote size={20} className={paymentMethod === "COD" ? "text-brand-600" : "text-gray-500"} />
                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600">Pay when your order is delivered.</p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "ONLINE" ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"
                }`}
              >
                <div className="mt-1">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard size={20} className={paymentMethod === "ONLINE" ? "text-brand-600" : "text-gray-500"} />
                    <span className="font-bold text-gray-900">Pay Online</span>
                  </div>
                  <p className="text-sm text-gray-600">Online payment will be processed after order creation.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column - Price Details */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
              Price Details
            </h2>

            <div className="space-y-3 text-sm mb-4 border-b border-gray-100 pb-4">
              <div className="flex justify-between text-gray-600">
                <span>Product Subtotal</span>
                <span>₹{Number(pricing.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{Number(pricing.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {Number(pricing.shippingCharge) === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${Number(pricing.shippingCharge).toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total Amount</span>
              <span>₹{Number(pricing.total).toFixed(2)}</span>
            </div>

            <Button 
              className="w-full text-base py-3" 
              disabled={isCreating}
              onClick={handleContinue}
            >
              {isCreating ? "Processing..." : "Continue"}
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              By continuing, you agree to our <Link to="/terms" className="text-brand-600">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </div>

      {showMockRazorpay && (
        <RazorpayMockModal 
          amount={pricing.total}
          onConfirmPayment={processOnlinePayment}
          onCancel={handleMockCancel}
        />
      )}
    </div>
  );
};

export default PaymentPage;
