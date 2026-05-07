import axios from 'axios';
import Product from '../models/Product.js';

/**
 * @desc    Get frequently bought together recommendations
 * @route   GET /api/products/:id/recommendations
 * @access  Public
 */
export const getProductRecommendations = async (req, res) => {
  try {
    const productId = req.params.id;

    // 1. Call the Python ML Microservice
    let recommendedIds = [];
    try {
      const mlResponse = await axios.get(`http://127.0.0.1:8000/recommend/${productId}`);
      recommendedIds = mlResponse.data || [];
    } catch (mlError) {
      console.error("ML Service Error:", mlError.message);
      // Fallback: If ML service is down, just return empty array instead of crashing
      return res.status(200).json([]);
    }

    if (recommendedIds.length === 0) {
      // Fallback: Cold start problem for new products without ML data
      // Fetch 4 other products from the same category
      const currentProduct = await Product.findById(productId).select('category');
      if (currentProduct && currentProduct.category) {
        const fallbackProducts = await Product.find({ 
          category: currentProduct.category,
          _id: { $ne: productId } 
        }).limit(4).select('_id');
        recommendedIds = fallbackProducts.map(p => p._id.toString());
      }
    }

    if (recommendedIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Fetch the full Product documents from MongoDB
    const products = await Product.find({ _id: { $in: recommendedIds } })
      .populate("category", "name slug")
      .populate("wholesaler", "shopName")
      .lean();

    // 3. Format the pricing for the user (similar to getProducts)
    // We need to attach the calculated price depending on who is viewing
    const formattedProducts = products.map((product) => {
      // Re-hydrate mongoose document so we can use the instance method
      const doc = new Product(product);
      const priceInfo = doc.getPriceForUser(req.user);
      
      return {
        ...product,
        priceInfo,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error in getProductRecommendations:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};
