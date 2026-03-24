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

    retailerPriceOverride: {
      type: Number,
      default: null,
      min: [0, "Retail price cannot be negative"],
    },

    bulkPricing: [
      {
        minQuantity: { type: Number, min: 1, required: true },
        pricePerUnit: { type: Number, min: 0, required: true },
        _id: false,
      },
    ],

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

// Virtuals
productSchema.virtual("suggestedRetailPrice").get(function () {
  const DEFAULT_MULTIPLIER = 1.38; // ~38% margin - can be made category-specific later
  return Math.round(this.wholesalerPrice * DEFAULT_MULTIPLIER);
});

productSchema.virtual("consumerPrice").get(function () {
  return this.retailerPriceOverride || this.suggestedRetailPrice;
});

// Helper method to return price info based on user role
productSchema.methods.getPriceForUser = function (user) {
  let info = {};

  if (!user) {
    // Guest / Consumer
    info = {
      finalPrice: this.consumerPrice,
      roleShownAs: "consumer",
    };
  } else if (user.role === "wholesaler") {
    info = {
      sellingPrice: this.wholesalerPrice,
      baseCost: this.baseCost, // only wholesaler sees cost
      roleShownAs: "wholesaler",
    };
  } else if (user.role === "retailer") {
    info = {
      purchasePrice: this.wholesalerPrice,
      suggestedSellingPrice: this.suggestedRetailPrice,
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
      suggestedRetailPrice: this.suggestedRetailPrice,
      retailerPriceOverride: this.retailerPriceOverride,
      consumerPrice: this.consumerPrice,
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