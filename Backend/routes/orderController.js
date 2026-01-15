// backend/routes/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes } = req.body;
    const userId = req.user.id;

    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 1. Validate stock & collect current prices (atomic check)
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const product = await Product.findById(cartItem._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${cartItem._id}` });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      const price = product.wholesalerPrice; // Retailer pays wholesaler price

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        pricePerUnit: price,
      });

      totalAmount += price * cartItem.quantity;
    }

    // 2. Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      phone,
      notes,
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // 3. Decrease stock (you can make this more atomic with transactions later)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};