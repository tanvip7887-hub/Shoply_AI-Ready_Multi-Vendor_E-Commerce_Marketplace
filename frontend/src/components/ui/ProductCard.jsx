import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../store/slices/wishlistSlice.js";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const image = product.images?.[0]?.url || "https://placehold.co/300x300?text=No+Image";
  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const isWishlisted = wishlistItems?.some((item) => item.product.id === product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      navigate("/login");
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product.id));
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block rounded-lg border border-gray-200 overflow-hidden bg-white transition-base hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-base group-hover:scale-105"
        />
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-base hover:scale-110 ${isWishlisted ? 'bg-brand-50 text-brand-600' : 'bg-white/90 hover:bg-white text-gray-600'}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        {discountPercent && (
          <span className="absolute bottom-2 left-2 bg-brand-600 text-white text-xs font-semibold px-2 py-0.5 rounded z-10">
            {discountPercent}% OFF
          </span>
        )}
        {product.inventory?.status === "OUT_OF_STOCK" && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm text-gray-800 line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">₹{displayPrice}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{product.price}</span>}
        </div>
        {product.brand && <p className="text-xs text-gray-400">{product.brand.name}</p>}
      </div>
    </Link>
  );
};

export default ProductCard;