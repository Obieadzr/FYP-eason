import StandingOrder from "../models/StandingOrder.js";
import Product from "../models/Product.js";

// Create a new recurring subscription
export const createStandingOrder = async (req, res) => {
  try {
    const { productId, quantity, frequency, shippingAddress, phone, startDate } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const pricePerUnit = product.wholesalerPrice || product.baseCost || 0;

    const standingOrder = await StandingOrder.create({
      user: req.user.id,
      company: req.user.companyId ? req.user.companyId : undefined,
      product: productId,
      quantity,
      pricePerUnit,
      frequency,
      shippingAddress,
      phone,
      nextDeliveryDate: new Date(startDate || Date.now())
    });

    res.status(201).json({ message: "Standing order created successfully", standingOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get my standing orders
export const getMyStandingOrders = async (req, res) => {
  try {
    // If user belongs to a company, fetch all for company, else just user's
    const query = req.user.companyId 
      ? { company: req.user.companyId } 
      : { user: req.user.id };

    const orders = await StandingOrder.find(query).populate('product').sort('-createdAt');
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update status (pause/cancel/resume)
export const updateStandingOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await StandingOrder.findById(id);
    if (!order) return res.status(404).json({ message: "Not found" });

    // Authorization
    if (order.user.toString() !== req.user.id && (!req.user.companyId || order.company?.toString() !== req.user.companyId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    await order.save();
    
    res.json({ message: `Standing order marked as ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
