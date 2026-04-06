import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Verify if user bought the product
    const orders = await Order.find({
      user: userId,
      status: { $in: ["delivered", "shipped"] }
    });

    const hasPurchased = orders.some(order => 
      order.items.some(item => item.product?.toString() === productId)
    );

    if (!hasPurchased) {
      return res.status(403).json({ message: "You can only review products you have purchased and received." });
    }

    // Pass the first matching order's ID for reference
    const orderId = orders.find(order => 
      order.items.some(item => item.product?.toString() === productId)
    )?._id;

    // Check if review already exists
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      // Update existing
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      await Review.create({
        product: productId,
        user: userId,
        rating,
        comment,
        order: orderId
      });
    }

    // Recalculate average rating on product
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      averageRating: avgRating,
      reviewCount: allReviews.length
    });

    res.status(200).json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName shopName avatar")
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
