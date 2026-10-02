import { useEffect, useState } from "react";
import { Star, ShoppingBag, MessageSquare, Package } from "lucide-react";
import { reviewApi } from "../../api/review.api.js";
import toast from "react-hot-toast";

const SellerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getSellerReviews();
      setReviews(res.data?.data || res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load product reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerReviews();
  }, []);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          View customer ratings and feedback for products in your store.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Average Store Rating
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-gray-900">
                {loading ? "..." : avgRating}
              </span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.round(Number(avgRating)) ? "currentColor" : "none"}
                    className={star <= Math.round(Number(avgRating)) ? "text-amber-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Based on customer feedback</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star size={24} fill="currentColor" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Reviews Received
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {loading ? "..." : totalReviews}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Verified buyer reviews</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
        </div>
      </div>

      {/* Reviews Table / Card List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Package size={16} className="text-brand-600" />
            Product Feedback History ({reviews.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent mb-2"></div>
            <p className="text-sm font-medium">Loading seller reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Star size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Product Reviews Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              When customers receive their orders and rate your products, their reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                    {r.product?.images?.[0]?.url ? (
                      <img src={r.product.images[0].url} alt={r.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{r.product?.name || "Product"}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Customer: {r.user?.name || "Verified Buyer"}</span>
                      <span>•</span>
                      <span>
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {r.comment && (
                      <p className="text-xs text-gray-700 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200 italic max-w-xl">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 shrink-0 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <span className="font-bold text-sm text-amber-800 mr-1">{r.rating}</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      fill={star <= r.rating ? "currentColor" : "none"}
                      className={star <= r.rating ? "text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerReviewsPage;
