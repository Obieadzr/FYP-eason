// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
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
    //   min: [
    //     function () {
    //       return this.baseCost;
    //     },
    //     "Wholesaler price must be at least equal to base cost",
    //   ],
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
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: null,
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
  if (!user) {
    // Guest / Consumer
    return {
      finalPrice: this.consumerPrice,
      roleShownAs: "consumer",
    };
  }

  if (user.role === "wholesaler") {
    return {
      sellingPrice: this.wholesalerPrice,
      baseCost: this.baseCost,
      roleShownAs: "wholesaler",
    };
  }

  if (user.role === "retailer") {
    return {
      purchasePrice: this.wholesalerPrice,
      suggestedSellingPrice: this.suggestedRetailPrice,
      currentSellingPrice: this.retailerPriceOverride || null,
      roleShownAs: "retailer",
    };
  }

  // Admin sees everything
  return {
    baseCost: this.baseCost,
    wholesalerPrice: this.wholesalerPrice,
    suggestedRetailPrice: this.suggestedRetailPrice,
    retailerPriceOverride: this.retailerPriceOverride,
    consumerPrice: this.consumerPrice,
    roleShownAs: "admin",
  };
};

// Export as default (matches your other models)
export default mongoose.model("Product", productSchema);