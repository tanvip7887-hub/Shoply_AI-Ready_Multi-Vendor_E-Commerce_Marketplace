import { useState } from "react";
import { Star, X, ShoppingBag } from "lucide-react";
import { reviewApi } from "../../api/review.api.js";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, item, orderId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating between 1 and 5.");
      return;
    }

    try {
      setSubmitting(true);
      await reviewApi.createReview({
        orderId,
        orderItemId: item.id,
        productId: item.productId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thank you! Your review has been submitted.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const activeStar = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Write a Product Review</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Preview */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              {item.product?.images?.[0]?.url ? (
                <img
                  src={item.product.images[0].url}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag size={24} className="text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {item.productName}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    size={32}
                    fill={star <= activeStar ? "currentColor" : "none"}
                    className={star <= activeStar ? "text-amber-400" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-amber-700">
              {activeStar === 5 && "Excellent (5 Stars)"}
              {activeStar === 4 && "Good (4 Stars)"}
              {activeStar === 3 && "Average (3 Stars)"}
              {activeStar === 2 && "Poor (2 Stars)"}
              {activeStar === 1 && "Very Poor (1 Star)"}
            </div>
          </div>

          {/* Optional Comment */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Share your experience (Optional)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product? How was the quality?"
              maxLength={1000}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <div className="text-[11px] text-gray-400 text-right mt-1">
              {comment.length}/1000 characters
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
