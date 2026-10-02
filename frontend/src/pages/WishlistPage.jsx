import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchWishlist, removeFromWishlist } from "../store/slices/wishlistSlice.js";
import ProductCard from "../components/ui/ProductCard.jsx";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { HeartCrack } from "lucide-react";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Button onClick={() => dispatch(fetchWishlist())}>Try Again</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
          <HeartCrack size={48} className="text-brand-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Save products you love and find them here later.
        </p>
        <Button onClick={() => navigate("/")} className="px-8">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Wishlist <span className="text-gray-500 text-lg font-normal">({items.length} Items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard product={item.product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
