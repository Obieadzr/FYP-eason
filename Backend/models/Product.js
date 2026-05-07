// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    wholesaler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"],
    },

    // New Pricing Fields (Approach B)
    baseCost: {
      type: Number,
      required: [true, "Base cost is required"],
      min: [0, "Base cost cannot be negative"],
    },

    wholesalerPrice: {
      type: Number,
      required: [true, "Wholesaler price is required"],
    },
    
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"]
    },

    retailerPriceOverride: {
      type: Number,
      default: null,
      min: [0, "Retail price cannot be negative"],
    },
    
    suggestedRetailPrice: {
      type: Number,
      default: null,
      min: [0, "Suggested Retail price cannot be negative"],
    },

    bulkPricing: [
      {
        minQuantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
      },
    ],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    moq: {
      type: Number,
      default: 1,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    image: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Helper method to return price info based on user role
productSchema.methods.getPriceForUser = function (user) {
  let info = {};
  
  // Calculate discounted wholesaler price if discount exists
  const discountMultiplier = 1 - ((this.discountPercentage || 0) / 100);
  const currentWholesalerPrice = Math.round(this.wholesalerPrice * discountMultiplier);
  
  // MSRP: user defined or 38% default
  const msrp = this.suggestedRetailPrice || Math.round(this.wholesalerPrice * 1.38);
  const currentConsumerPrice = this.retailerPriceOverride || msrp;

  if (!user) {
    // Guest / Consumer
    info = {
      finalPrice: currentConsumerPrice,
      originalPrice: this.retailerPriceOverride ? null : msrp,
      roleShownAs: "consumer",
    };
  } else if (user.role === "wholesaler") {
    info = {
      sellingPrice: currentWholesalerPrice,
      originalPrice: this.discountPercentage > 0 ? this.wholesalerPrice : null,
      baseCost: this.baseCost, // only wholesaler sees cost
      roleShownAs: "wholesaler",
    };
  } else if (user.role === "retailer") {
    info = {
      purchasePrice: currentWholesalerPrice,
      originalPrice: this.discountPercentage > 0 ? this.wholesalerPrice : null,
      suggestedSellingPrice: msrp,
      currentSellingPrice: this.retailerPriceOverride || null,
      roleShownAs: "retailer",
    };
    // STRICT: Never expose baseCost to retailer
    delete info.baseCost;
  } else {
    // Admin sees everything
    info = {
      baseCost: this.baseCost,
      wholesalerPrice: this.wholesalerPrice,
      discountedWholesalerPrice: currentWholesalerPrice,
      suggestedRetailPrice: msrp,
      retailerPriceOverride: this.retailerPriceOverride,
      consumerPrice: currentConsumerPrice,
      roleShownAs: "admin",
    };
  }

  // Final safety net: remove baseCost for anyone except admin & wholesaler
  if (user?.role !== "admin" && user?.role !== "wholesaler") {
    delete info.baseCost;
  }

  return info;
};

// Export as default (matches your other models)
export default mongoose.model("Product", productSchema);