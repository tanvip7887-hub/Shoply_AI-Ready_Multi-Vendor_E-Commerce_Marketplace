import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchCart, updateCartItem, removeCartItem, clearCart } from "../store/slices/cartSlice.js";
import { Trash2, Minus, Plus, AlertCircle, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalItems, cartSubtotal, isLoading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (id, currentQty, change, maxAvailable) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > maxAvailable) {
      toast.error(`Only ${maxAvailable} unit(s) available.`);
      return;
    }
    dispatch(updateCartItem({ id, quantity: newQty }));
  };

  const handleRemove = (id) => {
    dispatch(removeCartItem(id));
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to empty your entire cart?")) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading && items.length === 0) {
    return <div className="min-h-screen flex justify-center items-center">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-xl shadow-sm text-center max-w-md w-full">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/products"
            className="block w-full bg-brand-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const hasUnavailableItems = items.some(item => !item.isAvailable);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Cart Items Column */}
        <div className="lg:w-2/3 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({totalItems} Items)</h1>
            <button 
              onClick={handleClearCart}
              className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center transition"
            >
              <Trash2 size={16} className="mr-1.5" />
              Clear Cart
            </button>
          </div>
          
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row gap-6 relative ${!item.isAvailable ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            >
              {/* Product Image */}
              <Link to={`/products/${item.product.slug}`} className="shrink-0">
                <img 
                  src={item.product.primaryImage || "https://placehold.co/400?text=No+Image"} 
                  alt={item.product.name}
                  className={`w-28 h-28 object-cover rounded-md border ${!item.isAvailable ? 'opacity-60' : ''}`}
                />
              </Link>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <Link to={`/products/${item.product.slug}`}>
                      <h3 className={`text-lg font-semibold text-gray-900 line-clamp-2 ${!item.isAvailable ? 'text-gray-500' : ''}`}>
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-gray-900">₹{item.itemSubtotal}</p>
                  </div>
                  {item.product.brand && (
                    <p className="text-sm text-gray-500 mt-1">Brand: {item.product.brand}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Price: ₹{item.product.price} / unit</p>
                </div>

                {/* Error Banner for Unavailable Items */}
                {!item.isAvailable && (
                  <div className="mt-3 flex items-center text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">
                    <AlertCircle size={16} className="mr-2" />
                    {item.availableStock > 0 
                      ? `Only ${item.availableStock} item(s) are currently available. Please reduce quantity.`
                      : "This product is currently out of stock or unavailable."
                    }
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-6 mt-4">
                  {item.availableStock > 0 ? (
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1, item.availableStock)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-1.5 font-medium text-gray-900 border-x border-gray-300 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1, item.availableStock)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                        disabled={item.quantity >= item.availableStock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-red-500">Out of Stock</span>
                  )}

                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center text-gray-500 hover:text-red-500 transition text-sm font-medium"
                  >
                    <Trash2 size={16} className="mr-1.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Column */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl font-bold text-brand-600">₹{cartSubtotal}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Inclusive of all taxes</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={hasUnavailableItems || items.length === 0}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition flex justify-center items-center ${
                hasUnavailableItems || items.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-brand-600 text-white hover:bg-brand-700 shadow-md"
              }`}
            >
              Proceed to Checkout
            </button>

            {hasUnavailableItems && (
              <p className="text-sm text-red-600 mt-4 text-center">
                Please remove or update unavailable items to proceed.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
