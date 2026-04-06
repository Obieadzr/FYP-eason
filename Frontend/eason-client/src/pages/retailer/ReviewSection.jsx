import React, { useState, useEffect } from "react";
import { Star, Edit3, User, Loader2 } from "lucide-react";
import API from "../../utils/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function ReviewSection({ productId }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return toast.error("Please provide a valid rating");
    
    setSubmitting(true);
    try {
      await API.post(`/reviews/${productId}`, { rating, comment });
      toast.success("Review submitted successfully");
      setShowModal(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
  
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rev => rev.rating === r).length
  }));

  if (loading) return <div className="mt-14 pt-10 border-t border-gray-100 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <section className="mt-14 pt-10 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">{avgRating}</span>
            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>
        {user?.role === "retailer" && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition"
          >
            <Edit3 className="w-4 h-4" /> Write a Review
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews yet.</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-10">
          {/* Summary Bars */}
          <div className="md:col-span-4 space-y-3">
            {ratingCounts.map(rc => (
              <div key={rc.stars} className="flex items-center gap-3 text-sm">
                <span className="w-4 font-medium text-gray-700">{rc.stars}</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${reviews.length ? (rc.count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-500">{rc.count}</span>
              </div>
            ))}
          </div>

          {/* Review List */}
          <div className="md:col-span-8 space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase shrink-0">
                    {review.user?.firstName?.[0] || <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {review.user?.shopName || review.user?.firstName || "A Retailer"}
                    </h4>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                {review.comment && <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg">Leave a Review</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)} 
                      className={`transition ${rating >= star ? "text-amber-400" : "text-gray-200 hover:text-amber-200"}`}
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? "fill-amber-400" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell us more behind your rating</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How was the delivery?"
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none bg-gray-50"
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Post Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
