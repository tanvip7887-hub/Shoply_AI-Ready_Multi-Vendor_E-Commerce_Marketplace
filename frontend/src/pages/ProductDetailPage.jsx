import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ShoppingCart, Minus, Plus, Star, User } from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../api/product.api.js";
import { reviewApi } from "../api/review.api.js";
import { addToCart, updateCartItem, removeCartItem } from "../store/slices/cartSlice.js";
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice.js";
import { wishlistApi } from "../api/wishlist.api.js";
import Button from "../components/ui/Button.jsx";
import ProductDetailSkeleton from "../components/ui/ProductDetailSkeleton.jsx";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [localQuantity, setLocalQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [],
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlistItems?.some((item) => item.product.id === product?.id);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setLocalQuantity(1);

    productApi
      .getBySlug(slug)
      .then((res) => {
        setProduct(res.data);
        if (res.data?.id) {
          setReviewsLoading(true);
          reviewApi
            .getProductReviews(res.data.id)
            .then((revRes) => {
              setReviewsData(revRes.data?.data || revRes.data);
            })
            .catch(() => {})
            .finally(() => setReviewsLoading(false));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const requireLogin = () => {
    toast.error("Please login to continue");
    navigate("/login", { state: { from: { pathname: `/products/${slug}` } } });
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return requireLogin();
    setIsAdding(true);
    try {
      await dispatch(addToCart({ productId: product.id, quantity: localQuantity })).unwrap();
    } catch (err) {
      // Error handled by thunk
    } finally {
      setIsAdding(false);
    }
  };

  const cartItem = cartItems?.find((item) => item.product.id === product?.id);

  const handleUpdateCartQuantity = async (change, maxAvailable) => {
    if (!cartItem) return;
    const newQty = cartItem.quantity + change;
    
    if (newQty < 1) {
      dispatch(removeCartItem(cartItem.id));
      return;
    }
    
    if (newQty > maxAvailable) {
      toast.error(`Only ${maxAvailable} unit(s) available.`);
      return;
    }
    
    dispatch(updateCartItem({ id: cartItem.id, quantity: newQty }));
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return requireLogin();
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(product.id)).unwrap();
      } else {
        await dispatch(addToWishlist(product.id)).unwrap();
      }
    } catch (err) {
      // interceptor handles the toast
    }
  };
  const handleBuyNow = async () => {
    if (!isAuthenticated) return requireLogin();
    try {
      if (!cartItem) {
        await dispatch(addToCart({ productId: product.id, quantity: localQuantity })).unwrap();
      }
      navigate('/checkout');
    } catch (err) {
      // API error intercepted or generic error
    }
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-600">Product not found.</p>
        <Link to="/products" className="text-brand-600 font-medium mt-2 inline-block">
          Browse other products
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: "https://placehold.co/600x600?text=No+Image" }];
  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
      {/* Image gallery */}
      <div>
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
          <img
            src={images[activeImage].url}
            alt={product.name}
            className="w-full h-full object-cover transition-base"
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-base ${
                  i === activeImage ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        {product.brand && (
          <Link to={`/products?brandId=${product.brand.id}`} className="text-sm text-brand-600 font-medium">
            {product.brand.name}
          </Link>
        )}
        <h1 className="text-2xl font-semibold mt-1 mb-3">{product.name}</h1>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold text-gray-900">₹{displayPrice}</span>
          {hasDiscount && (
            <>
              <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
              <span className="text-sm font-semibold text-green-600">{discountPercent}% OFF</span>
            </>
          )}
        </div>

        {product.category && (
          <p className="text-sm text-gray-500 mb-4">
            Category:{" "}
            <Link to={`/products?categoryId=${product.category.id}`} className="text-brand-600 hover:underline">
              {product.category.name}
            </Link>
          </p>
        )}

        {product.description && <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>}

        {product.seller?.businessName && (
          <p className="text-sm text-gray-500 mb-6">
            Sold by <span className="font-medium text-gray-700">{product.seller.businessName}</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="text-xs text-gray-500 block">Stock Status</span>
            <span className={`text-sm font-medium ${product.inventory?.status === "OUT_OF_STOCK" ? "text-red-600" : "text-green-600"}`}>
              {product.inventory?.status === "OUT_OF_STOCK" ? "Out of Stock" : 
               product.inventory?.status === "LOW_STOCK" ? "Low Stock (Only a few left)" : "In Stock"}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">SKU</span>
            <span className="text-sm font-medium text-gray-900">{product.sku}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Weight</span>
            <span className="text-sm font-medium text-gray-900">{product.weight ? `${product.weight} kg` : "—"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Dimensions</span>
            <span className="text-sm font-medium text-gray-900">
              {product.length && product.width && product.height ? `${product.length} × ${product.width} × ${product.height} cm` : "—"}
            </span>
          </div>
        </div>

        {/* Quantity selector or Cart Controls */}
        <div className="flex flex-col gap-6 mb-8">
          {cartItem ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-green-600 flex items-center">
                Added to Cart ✓
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center border rounded-md w-fit">
                <button
                  onClick={() => setLocalQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-gray-50 transition-base"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm">{localQuantity}</span>
                <button
                  onClick={() => setLocalQuantity((q) => q + 1)}
                  className="p-2 hover:bg-gray-50 transition-base"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={cartItem ? () => navigate("/cart") : handleAddToCart} 
              isLoading={isAdding} 
              disabled={product.inventory?.status === "OUT_OF_STOCK"}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              {product.inventory?.status === "OUT_OF_STOCK" 
                ? "Out of Stock" 
                : cartItem ? "Go to Cart" : "Add to Cart"}
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
              disabled={product.inventory?.status === "OUT_OF_STOCK" || isAdding}
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
            <button
              onClick={handleToggleWishlist}
              className={`p-3 rounded-md border transition-base ${
                isWishlisted ? "bg-brand-50 border-brand-600 text-brand-600" : "border-gray-300 text-gray-500 hover:border-brand-400"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="text-amber-500 fill-amber-500" size={22} />
          Customer Reviews & Ratings
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Rating Summary Card */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center flex flex-col justify-center">
            <div className="text-5xl font-extrabold text-gray-900">
              {reviewsData.averageRating > 0 ? reviewsData.averageRating : "0.0"}
            </div>
            <div className="flex justify-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={star <= Math.round(reviewsData.averageRating) ? "currentColor" : "none"}
                  className={star <= Math.round(reviewsData.averageRating) ? "text-amber-400" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Based on {reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? "rating" : "ratings"}
            </p>

            {/* Distribution Bars */}
            <div className="mt-6 space-y-2 text-xs text-gray-600 text-left">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsData.distribution?.[stars] || 0;
                const percent = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-10 font-bold shrink-0 flex items-center gap-1">
                      {stars} <Star size={12} fill="currentColor" className="text-amber-400" />
                    </span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium text-gray-400 shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {reviewsLoading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent mb-2"></div>
                <p className="text-xs">Loading reviews...</p>
              </div>
            ) : reviewsData.reviews?.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <Star size={36} className="mx-auto text-gray-300 mb-2" />
                <h4 className="font-bold text-gray-700 text-sm">No Reviews Yet</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Be the first to review this product after your order is delivered!
                </p>
              </div>
            ) : (
              reviewsData.reviews.map((r) => (
                <div key={r.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                        {r.user?.name ? r.user.name[0] : "U"}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-900">{r.user?.name || "Customer"}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Verified Purchase ✓</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={star <= r.rating ? "currentColor" : "none"}
                        className={star <= r.rating ? "text-amber-400" : "text-gray-200"}
                      />
                    ))}
                  </div>

                  {r.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed font-normal pt-1">
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;